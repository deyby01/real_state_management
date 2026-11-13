import TipoPropiedad from "../models/TipoPropiedad.js"

/**
 * Lists the active property types.
 *
 * Route: GET /api/tipo-propiedades (public: the catalog filters by type, RF5).
 *
 * Responses: 200 list · 500 server error.
 */
export const getTipoPropiedad = async (req, res) => {
    try {
        const tipoPropiedad = await TipoPropiedad.find({ activo: true })
        res.status(200).json(tipoPropiedad)
    } catch (error) {
        res.status(500).json({mensaje: "Error al obtener Tipo Propiedad", error: error.message})
    }
}

/**
 * Creates a property type.
 *
 * Route: POST /api/tipo-propiedades (ADMIN only).
 *
 * Responses: 201 created · 400 invalid data · 401/403 auth · 409 duplicate name.
 */
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