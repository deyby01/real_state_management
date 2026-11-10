import mongoose from "mongoose"
import Propietario from "../models/Propietario.js"

export const getPropietarios = async (req, res) => {
    try {
        const propietarios = await Propietario.find({ activo: true })
        res.status(200).json(propietarios)
    } catch (error) {
        res.status(500).json({mensaje: "Error al obtener propietarios", error: error.message})
    }
}

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
