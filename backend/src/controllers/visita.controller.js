import Visita, { ESTADOS_VISITA, DURACION_VISITA_MS } from "../models/Visita.js"
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
 * - Populates executive details (`nombre email rol`).
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
 * - Populates executive details (`nombre email rol`).
 *
 * Responses: 200 visit details · 400 malformed id · 401/403 auth · 404 not found · 500 server error.
 */
export const getVisitaById = async (req, res) => {
    try {
        const { id } = req.params

        const visita = await Visita.findById(id).populate("ejecutivoId", "nombre email rol")

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
 * Creates a visit request with collision/overlap check.
 *
 * Route: POST /api/visitas (ADMIN, EJECUTIVO).
 * - Whitelist: only `propiedadId`, `clienteId`, `ejecutivoId`, `fechaInicio`, and `observaciones`
 *   are read from the body; `estado`, `resultado`, and `fechaFin` are ignored. A new visit
 *   always starts as SOLICITADA.
 * - Validates that `fechaInicio` is a valid date and strictly in the future.
 * - Prevents executive schedule overlap (RN-10): cross-interval check ($lt/$gt) excludes
 *   CANCELADA and RECHAZADA visits; returns 409 with conflicting visit details.
 * - Logs a CREACION entry in the audit log after saving (RN-13).
 * - Temporary contract (Option A): `ejecutivoId` is received in the body until step 3c,
 *   where it will be copied from the property (D10) and removed from the whitelist.
 * - Not verified yet: `propiedadId` existence/state (RN-16, step 3c) and `clienteId`
 *   (Clientes model not merged, Jose).
 * - Known limitation: concurrent requests for the same executive and interval may both pass
 *   overlap check without MongoDB exclusion constraints (acceptable without transactions).
 *
 * Responses: 201 created · 400 missing fields, malformed id or invalid/past date · 401/403 auth ·
 * 409 executive overlap conflict · 500 server error.
 */
export const postVisita = async (req, res) => {
    try {
        // Whitelist fields to prevent mass assignment (client cannot set estado or resultado)
        const { propiedadId, clienteId, ejecutivoId, fechaInicio, observaciones } = req.body

        if (!propiedadId || !clienteId || !ejecutivoId || !fechaInicio) {
            return res.status(400).json({
                mensaje: "Los campos propiedadId, clienteId, ejecutivoId y fechaInicio son obligatorios"
            })
        }

        // Validate date format and future constraint before checking overlap to avoid returning
        // a misleading 409 Conflict when the date is actually invalid or in the past (400 Bad Request)
        const fechaInicioDate = new Date(fechaInicio)
        if (isNaN(fechaInicioDate.getTime())) {
            return res.status(400).json({ mensaje: "La fecha de inicio no es válida" })
        }
        if (fechaInicioDate <= new Date()) {
            return res.status(400).json({ mensaje: "La fecha de inicio debe ser futura" })
        }

        // Fixed duration (D8): calculate end time for the overlap query
        const fechaFinDate = new Date(fechaInicioDate.getTime() + DURACION_VISITA_MS)

        // Overlap check (RN-10): two intervals intersect if (existing.start < new.end && existing.end > new.start).
        // Checked globally across all properties because an executive cannot attend two places at once.
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

        // Populate executive details on 201 response to match the shape returned by GET endpoints
        await visitaGuardada.populate("ejecutivoId", "nombre email rol")

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