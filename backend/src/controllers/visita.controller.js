import Visita, { ESTADOS_VISITA } from "../models/Visita.js"

// GET /api/visitas
// Filtros opcionales: ?estado=, ?propiedadId=, ?ejecutivoId=, ?desde=, ?hasta=
export const getVisitas = async (req, res) => {
    try {
        const { estado, propiedadId, ejecutivoId, desde, hasta } = req.query
        const filtro = {}

        // Validación y filtro por estado
        if (estado) {
            if (!ESTADOS_VISITA.includes(estado)) {
                return res.status(400).json({
                    mensaje: `Estado inválido. Los estados permitidos son: ${ESTADOS_VISITA.join(", ")}`
                })
            }
            filtro.estado = estado
        }

        // Filtros por IDs relacionados
        if (propiedadId) filtro.propiedadId = propiedadId
        if (ejecutivoId) filtro.ejecutivoId = ejecutivoId

        // Rango de fechas (agenda)
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

        // Consultamos ordenando por fechaInicio ascendente (próximas primero)
        // Poblamos solo ejecutivoId (Usuario ya existe en el repo)
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

// GET /api/visitas/:id
export const getVisitaById = async (req, res) => {
    try {
        const { id } = req.params

        const visita = await Visita.findById(id).populate("ejecutivoId", "nombre email rol")

        if (!visita) {
            return res.status(404).json({ mensaje: "Visita no encontrada" })
        }

        res.status(200).json(visita)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "ID de visita inválido",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al obtener la visita", error: error.message })
    }
}