import Visita, { ESTADOS_VISITA, DURACION_VISITA_MS } from "../models/Visita.js"
import Propiedad from "../models/Propiedad.js"
import { registrarBitacora } from "../services/bitacora.service.js"

/**
 * Allowed visit state transitions (§6.3).
 * Terminal states (REALIZADA, RECHAZADA, CANCELADA) have no transitions out.
 * Handled with fallback `TRANSICIONES[estado] || []` to avoid runtime TypeError.
 */
const TRANSICIONES = {
    SOLICITADA: ["CONFIRMADA", "RECHAZADA", "CANCELADA"],
    CONFIRMADA: ["REALIZADA", "CANCELADA"]
}

/**
 * Helper to execute a state transition consistently across endpoints.
 * Validates against TRANSICIONES, applies extra updates, saves the document,
 * logs a CAMBIO_ESTADO entry in the audit log (RN-13) and populates the response.
 */
const transicionarVisita = async (req, res, estadoNuevo, { observacion, cambios = {} } = {}) => {
    try {
        const visita = await Visita.findById(req.params.id)
        if (!visita) {
            return res.status(404).json({ mensaje: "Visita no encontrada" })
        }

        const estadoAnterior = visita.estado
        const permitidos = TRANSICIONES[estadoAnterior] || []

        if (!permitidos.includes(estadoNuevo)) {
            return res.status(409).json({
                mensaje: `No se puede pasar de ${estadoAnterior} a ${estadoNuevo}`,
                estadoActual: estadoAnterior,
                transicionesPermitidas: permitidos
            })
        }

        // Apply extra fields (such as resultado) and update status
        Object.assign(visita, cambios)
        visita.estado = estadoNuevo

        // Document save pattern triggers pre("validate") hook if necessary
        const visitaGuardada = await visita.save()

        const observacionTexto = typeof observacion === "string" ? observacion.trim() : undefined

        await registrarBitacora({
            entidad: "VISITA",
            entidadId: visitaGuardada._id,
            accion: "CAMBIO_ESTADO",
            estadoAnterior,
            estadoNuevo,
            usuarioId: req.usuario._id,
            observacion: observacionTexto
        })

        await visitaGuardada.populate("ejecutivoId", "nombre email rol")
        await visitaGuardada.populate("propiedadId", "titulo direccion estado")

        return res.status(200).json(visitaGuardada)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de visita inválido", error: error.message })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: "Datos inválidos", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al actualizar el estado de la visita", error: error.message })
    }
}

/**
 * Lists visits with optional filters (agenda view).
 *
 * Route: GET /api/visitas (EJECUTIVO).
 * - Optional query filters:
 *   - `estado`: validated against ESTADOS_VISITA (400 if invalid).
 *   - `propiedadId`, `ejecutivoId`: filtered by ObjectId.
 *   - `desde`, `hasta`: date range on `fechaInicio`. Expects ISO 8601 strings
 *     with offset (e.g. ?desde=2026-11-15T00:00:00-03:00); bare YYYY-MM-DD parses
 *     as UTC midnight and truncates Chilean local time at 21:00 of the previous day.
 * - Chronological order: sorted by `fechaInicio` ascending (upcoming visits first).
 * - Populates executive (`nombre email rol`) and property (`titulo direccion estado`).
 *
 * Responses: 200 list · 400 invalid filter/date/id · 401/403 auth · 500 server error.
 */
export const getVisitas = async (req, res) => {
    try {
        const { estado, propiedadId, ejecutivoId, desde, hasta } = req.query
        const filtro = {}

        // Validate against allowed states so typos or unknown states return 400 instead of an empty list
        if (estado) {
            if (!ESTADOS_VISITA.includes(estado)) {
                return res.status(400).json({
                    mensaje: `Estado inválido. Los estados permitidos son: ${ESTADOS_VISITA.join(", ")}`
                })
            }
            filtro.estado = estado
        }

        if (propiedadId) filtro.propiedadId = propiedadId
        if (ejecutivoId) filtro.ejecutivoId = ejecutivoId

        // Date range filter: the query strings are parsed as sent. The client must include
        // the offset (ISO 8601); a bare YYYY-MM-DD is read as UTC midnight.
        if (desde || hasta) {
            filtro.fechaInicio = {}

            if (desde) {
                const fechaDesde = new Date(desde)
                if (isNaN(fechaDesde.getTime())) {
                    return res.status(400).json({ mensaje: "Parámetro 'desde' inválido. Debe ser una fecha válida" })
                }
                filtro.fechaInicio.$gte = fechaDesde
            }

            if (hasta) {
                const fechaHasta = new Date(hasta)
                if (isNaN(fechaHasta.getTime())) {
                    return res.status(400).json({ mensaje: "Parámetro 'hasta' inválido. Debe ser una fecha válida" })
                }
                filtro.fechaInicio.$lte = fechaHasta
            }
        }

        // Ascending order presents upcoming visits first in the executive's agenda
        const visitas = await Visita.find(filtro)
            .sort({ fechaInicio: 1 })
            .populate("ejecutivoId", "nombre email rol")
            .populate("propiedadId", "titulo direccion estado")

        res.status(200).json(visitas)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "ID inválido en los parámetros de búsqueda",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al obtener las visitas", error: error.message })
    }
}

/**
 * Retrieves a single visit by its ObjectId.
 *
 * Route: GET /api/visitas/:id (EJECUTIVO).
 * - Distinguishes between malformed ID format (400 CastError) and valid format
 *   that does not exist in the database (404 Not Found).
 * - Populates executive (`nombre email rol`) and property (`titulo direccion estado`).
 *
 * Responses: 200 visit details · 400 malformed id · 401/403 auth · 404 not found · 500 server error.
 */
export const getVisitaById = async (req, res) => {
    try {
        const { id } = req.params

        const visita = await Visita.findById(id)
            .populate("ejecutivoId", "nombre email rol")
            .populate("propiedadId", "titulo direccion estado")

        if (!visita) {
            return res.status(404).json({ mensaje: "Visita no encontrada" })
        }

        res.status(200).json(visita)
    } catch (error) {
        // Malformed 24-character hexadecimal string triggers CastError (client fault: 400)
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "ID de visita inválido",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al obtener la visita", error: error.message })
    }
}

/**
 * Creates a visit request validating property publication and executive schedule.
 *
 * Route: POST /api/visitas (EJECUTIVO; CLIENTE once clientes is merged).
 * - Whitelist: only `propiedadId`, `clienteId`, `fechaInicio`, and `observaciones`
 *   are read from the body; `estado`, `resultado`, and `fechaFin` are ignored.
 * - Enforces RN-16: property must exist, be active (`activo: true`), and be `PUBLICADA`.
 *   Returns 400 if property does not exist or was deleted; 409 if not in PUBLICADA status.
 * - Enforces D10: `ejecutivoId` is copied directly from the property to preserve historical
 *   traceability (never accepted from client).
 * - Validates that `fechaInicio` is a valid date and strictly in the future (400).
 * - Enforces RN-10: prevents executive schedule overlap using a cross-interval check
 *   ($lt/$gt) against all properties (excluding CANCELADA/RECHAZADA visits) → 409 with conflict details.
 * - Logs a CREACION entry in the audit log after saving (RN-13).
 * - Populates executive (`nombre email rol`) and property (`titulo direccion estado`) on 201 response.
 * - Not verified yet: `clienteId` reference (Clientes model not merged, Jose).
 * - Known limitation: concurrent requests for the same executive and interval may both pass
 *   overlap check without MongoDB exclusion constraints (acceptable without transactions).
 *
 * Responses: 201 created · 400 missing fields, invalid/deleted property, malformed id or past date ·
 * 401/403 auth · 409 property not published (RN-16) or executive overlap (RN-10) · 500 server error.
 */
export const postVisita = async (req, res) => {
    try {
        // Whitelist: ejecutivoId is excluded (copied from property, D10)
        const { propiedadId, clienteId, fechaInicio, observaciones } = req.body

        if (!propiedadId || !clienteId || !fechaInicio) {
            return res.status(400).json({
                mensaje: "Los campos propiedadId, clienteId y fechaInicio son obligatorios"
            })
        }

        // Validate date format and future constraint before checking property to avoid returning
        // a misleading 409 when the date is fundamentally invalid (400 Bad Request)
        const fechaInicioDate = new Date(fechaInicio)
        if (isNaN(fechaInicioDate.getTime())) {
            return res.status(400).json({ mensaje: "La fecha de inicio no es válida" })
        }
        if (fechaInicioDate <= new Date()) {
            return res.status(400).json({ mensaje: "La fecha de inicio debe ser futura" })
        }

        // RN-16: Property must exist, be active, and currently in PUBLICADA status
        const propiedad = await Propiedad.findOne({ _id: propiedadId, activo: true })
        if (!propiedad) {
            return res.status(400).json({ mensaje: "Propiedad no válida o eliminada" })
        }
        if (propiedad.estado !== "PUBLICADA") {
            return res.status(409).json({
                mensaje: "Solo se pueden agendar visitas en propiedades publicadas",
                estadoActual: propiedad.estado
            })
        }

        // D10: Executive is copied from the property to preserve visit history even if
        // the property is later reassigned to another executive (never taken from the body)
        const ejecutivoId = propiedad.ejecutivoId

        // Fixed duration (D8): calculate end time for the overlap query
        const fechaFinDate = new Date(fechaInicioDate.getTime() + DURACION_VISITA_MS)

        // Overlap check (RN-10): two intervals intersect if (existing.start < new.end && existing.end > new.start).
        // Evaluated using the property's executive, globally across all properties.
        const solapada = await Visita.findOne({
            ejecutivoId,
            estado: { $nin: ["CANCELADA", "RECHAZADA"] },
            fechaInicio: { $lt: fechaFinDate },
            fechaFin: { $gt: fechaInicioDate }
        })

        if (solapada) {
            return res.status(409).json({
                mensaje: "El ejecutivo ya tiene una visita agendada en ese horario",
                visitaEnConflicto: {
                    id: solapada._id,
                    fechaInicio: solapada.fechaInicio,
                    fechaFin: solapada.fechaFin,
                    estado: solapada.estado
                }
            })
        }

        const nuevaVisita = new Visita({
            propiedadId,
            clienteId,
            ejecutivoId,
            fechaInicio: fechaInicioDate,
            observaciones
        })

        // Save visit first; audit logging follows so a failed save does not leave an orphaned audit entry
        const visitaGuardada = await nuevaVisita.save()

        // Audit log (RN-13): estadoAnterior is omitted on CREACION.
        // If logging fails after save, the visit exists without log and catch returns 500 (known limitation)
        await registrarBitacora({
            entidad: "VISITA",
            entidadId: visitaGuardada._id,
            accion: "CREACION",
            estadoNuevo: "SOLICITADA",
            usuarioId: req.usuario._id,
            observacion: "Visita solicitada"
        })

        // Populate both executive and property to match the GET response shape
        await visitaGuardada.populate("ejecutivoId", "nombre email rol")
        await visitaGuardada.populate("propiedadId", "titulo direccion estado")

        res.status(201).json(visitaGuardada)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "Formato de ID inválido en el cuerpo de la petición",
                error: error.message
            })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({
                mensaje: "Error de validación del modelo",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al crear la visita", error: error.message })
    }
}

/**
 * Reschedules a visit's start date and recalculates its end date (RF7).
 *
 * Route: PUT /api/visitas/:id (EJECUTIVO; CLIENTE own visit once clientes is merged).
 * Body: { fechaInicio, observaciones? }.
 * - Whitelist: only `fechaInicio` and `observaciones` are updated. `ejecutivoId`,
 *   `propiedadId`, `clienteId`, `estado`, and `resultado` are ignored.
 * - Allowed only while visit is in SOLICITADA or CONFIRMADA (409 if terminal).
 * - Validates that new `fechaInicio` is valid and strictly in the future (400).
 * - Enforces RN-10 overlap check excluding this visit itself (_id: { $ne: visita._id }).
 * - Does not re-check RN-16: rescheduling adjusts the time of an existing agreement;
 *   if the property is unmarketable, the executive should cancel it (CANCELADA).
 * - Document save pattern triggers pre("validate") hook recalculating `fechaFin`.
 * - Audit log: Bitacora has no REPROGRAMACION action yet (requested to Deyby); not logged
 *   to avoid logging a fake CAMBIO_ESTADO where previous equals new state.
 *
 * Responses: 200 rescheduled · 400 invalid date/id · 401/403 auth · 404 not found ·
 * 409 terminal state or overlap conflict · 500 server error.
 */
export const putVisita = async (req, res) => {
    try {
        const { id } = req.params
        const { fechaInicio, observaciones } = req.body

        const visita = await Visita.findById(id)
        if (!visita) {
            return res.status(404).json({ mensaje: "Visita no encontrada" })
        }

        // Validate presence and future constraint before state check
        if (!fechaInicio) {
            return res.status(400).json({ mensaje: "El campo fechaInicio es obligatorio para reprogramar" })
        }

        const fechaInicioDate = new Date(fechaInicio)
        if (isNaN(fechaInicioDate.getTime())) {
            return res.status(400).json({ mensaje: "La fecha de inicio no es válida" })
        }
        if (fechaInicioDate <= new Date()) {
            return res.status(400).json({ mensaje: "La fecha de inicio debe ser futura" })
        }

        // Only active requests can be rescheduled
        if (!["SOLICITADA", "CONFIRMADA"].includes(visita.estado)) {
            return res.status(409).json({
                mensaje: `No se puede reprogramar una visita en estado ${visita.estado}`,
                estadoActual: visita.estado
            })
        }

        const fechaFinDate = new Date(fechaInicioDate.getTime() + DURACION_VISITA_MS)

        // Overlap check (RN-10): exclude this visit itself so it does not collide with its own previous slot
        const solapada = await Visita.findOne({
            _id: { $ne: visita._id },
            ejecutivoId: visita.ejecutivoId,
            estado: { $nin: ["CANCELADA", "RECHAZADA"] },
            fechaInicio: { $lt: fechaFinDate },
            fechaFin: { $gt: fechaInicioDate }
        })

        if (solapada) {
            return res.status(409).json({
                mensaje: "El ejecutivo ya tiene una visita agendada en ese horario",
                visitaEnConflicto: {
                    id: solapada._id,
                    fechaInicio: solapada.fechaInicio,
                    fechaFin: solapada.fechaFin,
                    estado: solapada.estado
                }
            })
        }

        visita.fechaInicio = fechaInicioDate

        if (observaciones !== undefined) {
            if (typeof observaciones !== "string") {
                return res.status(400).json({ mensaje: "El campo observaciones debe ser texto" })
            }
            visita.observaciones = observaciones
        }
        
        

        const visitaGuardada = await visita.save()

        await visitaGuardada.populate("ejecutivoId", "nombre email rol")
        await visitaGuardada.populate("propiedadId", "titulo direccion estado")

        return res.status(200).json(visitaGuardada)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de visita inválido", error: error.message })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: "Error de validación", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al reprogramar la visita", error: error.message })
    }
}

/**
 * Confirms a visit request (SOLICITADA → CONFIRMADA).
 *
 * Route: PATCH /api/visitas/:id/confirmar (EJECUTIVO).
 * Body: { observacion? }.
 * Responses: 200 confirmed · 400 invalid id · 401/403 auth · 404 not found · 409 transition not allowed · 500 server error.
 */
export const confirmarVisita = (req, res) =>
    transicionarVisita(req, res, "CONFIRMADA", {
        observacion: req.body?.observacion || "Visita confirmada por el ejecutivo"
    })

/**
 * Rejects a visit request (SOLICITADA → RECHAZADA).
 *
 * Route: PATCH /api/visitas/:id/rechazar (EJECUTIVO).
 * Body: { observacion? }.
 * Responses: 200 rejected · 400 invalid id · 401/403 auth · 404 not found · 409 transition not allowed · 500 server error.
 */
export const rechazarVisita = (req, res) =>
    transicionarVisita(req, res, "RECHAZADA", {
        observacion: req.body?.observacion || "Visita rechazada por el ejecutivo"
    })

/**
 * Cancels a visit (SOLICITADA or CONFIRMADA → CANCELADA).
 *
 * Route: PATCH /api/visitas/:id/cancelar (EJECUTIVO; CLIENTE own visit once clientes is merged).
 * Body: { observacion? }.
 * Responses: 200 cancelled · 400 invalid id · 401/403 auth · 404 not found · 409 transition not allowed · 500 server error.
 */
export const cancelarVisita = (req, res) =>
    transicionarVisita(req, res, "CANCELADA", {
        observacion: req.body?.observacion || "Visita cancelada"
    })

/**
 * Registers visit outcome and marks it as completed (CONFIRMADA → REALIZADA).
 *
 * Route: PATCH /api/visitas/:id/resultado (EJECUTIVO).
 * Body: { resultado, observacion? }.
 * - Validates that `resultado` is present and non-empty (400) before triggering transition.
 * Responses: 200 completed · 400 missing resultado or invalid id · 401/403 auth · 404 not found ·
 * 409 transition not allowed · 500 server error.
 */
export const registrarResultadoVisita = (req, res) => {
    const { resultado, observacion } = req.body || {}

    if (typeof resultado !== "string" || !resultado.trim()) {
        return res.status(400).json({
            mensaje: "El campo resultado es obligatorio para marcar la visita como realizada"
        })
    }

    return transicionarVisita(req, res, "REALIZADA", {
        observacion: observacion || "Resultado de visita registrado",
        cambios: { resultado: resultado.trim() }
    })
}