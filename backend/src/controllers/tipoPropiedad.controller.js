import TipoPropiedad from "../models/TipoPropiedad.js"

export const getTipoPropiedad = async (req, res) => {
    try {
        const tipoPropiedad = await TipoPropiedad.find({ activo: true })
        res.status(200).json(tipoPropiedad)
    } catch (error) {
        res.status(500).json({mensaje: "Error al obtener Tipo Propiedad", error: error.message})
    }
}

export const postTipoPropiedad = async (req, res) => {
    try {
        const { nombre } = req.body
        const nuevoTipo = await TipoPropiedad.create({ nombre })
        res.status(201).json(nuevoTipo)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({mensaje: "Tipo de Propiedad ya existente", error: error.message})
        }
        res.status(400).json({mensaje: "Error al crear el Tipo de Propiedad", error: error.message})
    }
}