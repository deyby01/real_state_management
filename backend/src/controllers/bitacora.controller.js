import Bitacora from "../models/Bitacora.js"

/**
 * Lists audit log entries, newest first, with the user who made each change.
 *
 * Route: GET /api/bitacora (ADMIN only).
 * Optional filters: ?entidad=PROPIEDAD|VISITA|SOLICITUD and ?entidadId=<id>.
 * Only whitelisted query fields are copied to the filter (prevents NoSQL injection).
 *
 * Responses: 200 list · 400 invalid entidadId · 401/403 auth · 500 server error.
 */
export const getBitacora = async (req, res) => {
    try {
        const { entidad, entidadId } = req.query
        const filtro = {}

        if (entidad) filtro.entidad = entidad
        if (entidadId) filtro.entidadId = entidadId
        const entradas = await Bitacora.find(filtro)
            .sort({ fecha: -1 })
            .populate("usuarioId", "nombre email rol")

        res.status(200).json(entradas)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de entidad inválido", error: error.message })
        }
        res.status(500).json({ mensaje: "Error al obtener la bitácora", error: error.message })
    }
}