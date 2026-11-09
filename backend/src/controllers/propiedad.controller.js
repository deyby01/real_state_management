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