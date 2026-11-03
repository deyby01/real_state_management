import Bitacora from "../models/Bitacora.js"

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