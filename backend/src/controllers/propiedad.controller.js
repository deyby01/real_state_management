import Propiedad from "../models/Propiedad.js"
import TipoPropiedad from "../models/TipoPropiedad.js"
import { registrarBitacora } from "../services/bitacora.service.js"

export const crearPropiedad = async (req, res) => {
    try {
        const { titulo, tipoId, propietarioId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada } = req.body

        const tipo = await TipoPropiedad.findOne({ _id: tipoId, activo: true })
        if (!tipo) {
            return res.status(400).json({ mensaje: "Tipo de propiedad no válido o inactivo" })
        }

        // TODO: Verify propietarioId when the Propietario model exists (Santiago)

        const propiedad = new Propiedad({
            titulo,
            tipoId,
            propietarioId,
            ejecutivoId: req.usuario._id,
            direccion,
            superficie,
            dormitorios,
            banos,
            estacionamientos,
            valorArriendo,
            gastosComunes,
            caracteristicas,
            imagenes,
            destacada
        })

        await propiedad.save()

        await registrarBitacora({
            entidad: "PROPIEDAD",
            entidadId: propiedad._id,
            accion: "CREACION",
            estadoNuevo: propiedad.estado,
            usuarioId: req.usuario._id
        })

        return res.status(201).json({ mensaje: "Propiedad creada exitosamente", propiedad })

    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ mensaje: "Error de validación al crear la propiedad", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al crear la propiedad", error: error.message })
    }   
}


export const listarPropiedades = async (req, res) => {
    try {
        const { estado, ejecutivoId } = req.query
        const filtro = { activo: true }

        if (estado) filtro.estado = estado
        if (ejecutivoId) filtro.ejecutivoId = ejecutivoId

        const propiedades = await Propiedad.find(filtro)
            .sort({ createdAt: -1 })
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            // TODO: populate propietarioId when the Propietario model exists (Santiago)
        
        res.status(200).json(propiedades)

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "Filtro ejecutivoId inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al listar propiedades", error: error.message })
    }
}


export const obtenerPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findOne({ _id: req.params.id, activo: true })
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            // TODO: populate propietarioId when the Propietario model exists (Santiago)
        
        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        res.status(200).json(propiedad)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad invalido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al obtener la propiedad", error: error.message })
    }
}


export const actualizarPropiedad = async (req, res) => {
    try {
        const { titulo, tipoId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada } = req.body

        if (tipoId) {
            const tipo = await TipoPropiedad.findOne({ _id: tipoId, activo: true })
            if (!tipo) {
                return res.status(400).json({ mensaje: "Tipo de propiedad no válido o inactivo" })
            }
        }

        const propiedad = await Propiedad.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            { titulo, tipoId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada },
            { returnDocument: "after", runValidators: true }
        )
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            // TODO: populate propietarioId when the Propietario model exists (Santiago)

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        return res.status(200).json({ mensaje: "Propiedad actualizada exitosamente", propiedad })
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ mensaje: "Error de validación al actualizar la propiedad", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al actualizar la propiedad", error: error.message })
    }
}


export const eliminarPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findOne({ _id: req.params.id, activo: true })

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        if (["RESERVADA", "ARRENDADA"].includes(propiedad.estado)) {
            return res.status(409).json({ mensaje: "No se puede eliminar una propiedad que está reservada o arrendada" })
        }

        propiedad.activo = false
        await propiedad.save()

        await registrarBitacora({
            entidad: "PROPIEDAD",
            entidadId: propiedad._id,
            accion: "ELIMINACION",
            estadoAnterior: propiedad.estado,
            estadoNuevo: propiedad.estado,
            usuarioId: req.usuario._id
        })

        return res.status(200).json({ mensaje: "Propiedad eliminada exitosamente" })
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al eliminar la propiedad", error: error.message })
    }
}