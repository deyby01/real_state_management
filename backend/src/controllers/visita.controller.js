import Visita, { ESTADOS_VISITA, DURACION_VISITA_MS } from "../models/Visita.js"
import Propiedad from "../models/Propiedad.js"
import { registrarBitacora } from "../services/bitacora.service.js"

/**
 * Lists visits with optional filters (agenda view).
 *
 * Route: GET /api/visitas (ADMIN, EJECUTIVO).
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
 * Route: GET /api/visitas/:id (ADMIN, EJECUTIVO).
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
 * Route: POST /api/visitas (ADMIN, EJECUTIVO).
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