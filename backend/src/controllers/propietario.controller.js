import mongoose from "mongoose"
import Propietario from "../models/Propietario.js"

/**
 * Lists active owner records for owner administration (RF2).
 * Route: GET /api/propietarios (EJECUTIVO only, enforced by route middleware).
 * Soft-deleted owners are excluded; an empty result is returned as an empty array.
 * Responses: 200 list · 401/403 auth · 500 server error.
 */
export const getPropietarios = async (req, res) => {
    try {
        const propietarios = await Propietario.find({ activo: true })
        res.status(200).json(propietarios)
    } catch (error) {
        res.status(500).json({mensaje: "Error al obtener propietarios", error: error.message})
    }
}

/**
 * Creates an owner business record, not a login account (RF2, decision D1).
 * Route: POST /api/propietarios (EJECUTIVO only).
 * Reads only rut, nombre, email and telefono; activo defaults to true in the model.
 * The schema normalizes RUTs and the unique index rejects duplicates (DATA_MODEL).
 * Responses: 201 created · 400 invalid data · 409 duplicate RUT · 401/403 auth · 500 server error.
 */
export const postPropietario = async (req, res) => {
    try {
        const { rut, nombre, email, telefono } = req.body ?? {}
        const propietario = await Propietario.create({ rut, nombre, email, telefono })
        res.status(201).json(propietario)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({mensaje: "El RUT ya está registrado", error: error.message})
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({mensaje: "Datos del propietario inválidos", error: error.message})
        }
        res.status(500).json({mensaje: "Error al crear propietario", error: error.message})
    }
}

/**
 * Retrieves one active owner for owner administration (RF2).
 * Route: GET /api/propietarios/:id (EJECUTIVO only).
 * Validates the ObjectId before querying; missing and soft-deleted records return 404.
 * Responses: 200 owner · 400 invalid ID · 404 not found · 401/403 auth · 500 server error.
 */
export const getPropietarioById = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({mensaje: "ID de propietario inválido"})
        }
        const propietario = await Propietario.findOne({ _id: req.params.id, activo: true })
        if (!propietario) {
            return res.status(404).json({mensaje: "Propietario no encontrado"})
        }
        res.status(200).json(propietario)
    } catch (error) {
        res.status(500).json({mensaje: "Error al obtener propietario", error: error.message})
    }
}

/**
 * Updates supplied business fields of an active owner (RF2, RNF-06).
 * Route: PUT /api/propietarios/:id (EJECUTIVO only).
 * Allows only rut, nombre, email and telefono; omitted fields remain unchanged.
 * Rejects bodies with no editable fields. Schema validation runs on updates;
 * neither _id nor activo can be changed through this operation.
 * Responses: 200 updated · 400 invalid ID/data · 404 not found · 409 duplicate RUT
 * · 401/403 auth · 500 server error.
 */
export const putPropietario = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({mensaje: "ID de propietario inválido"})
        }
        const cambios = {}
        for (const campo of ["rut", "nombre", "email", "telefono"]) {
            if (Object.hasOwn(req.body ?? {}, campo)) {
                cambios[campo] = req.body[campo]
            }
        }
        if (Object.keys(cambios).length === 0) {
            return res.status(400).json({mensaje: "Debes proporcionar datos del propietario para actualizar"})
        }
        const propietario = await Propietario.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            { $set: cambios },
            { returnDocument: "after", runValidators: true }
        )
        if (!propietario) {
            return res.status(404).json({mensaje: "Propietario no encontrado"})
        }
        res.status(200).json(propietario)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({mensaje: "El RUT ya está registrado", error: error.message})
        }
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({mensaje: "Datos del propietario inválidos", error: error.message})
        }
        res.status(500).json({mensaje: "Error al actualizar propietario", error: error.message})
    }
}

/**
 * Soft-deletes an owner by setting activo to false (RNF-10, RN-17).
 * Route: DELETE /api/propietarios/:id (EJECUTIVO only).
 * Preserves the document and its historical references; repeated deletion returns 404.
 * Responses: 200 message and inactive owner · 400 invalid ID · 404 not found
 * · 401/403 auth · 500 server error.
 */
export const deletePropietario = async (req, res) => {
    try {
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({mensaje: "ID de propietario inválido"})
        }
        const propietario = await Propietario.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            { $set: { activo: false } },
            { returnDocument: "after", runValidators: true }
        )
        if (!propietario) {
            return res.status(404).json({mensaje: "Propietario no encontrado"})
        }
        res.status(200).json({mensaje: "Propietario dado de baja", propietario})
    } catch (error) {
        res.status(500).json({mensaje: "Error al dar de baja al propietario", error: error.message})
    }
}
