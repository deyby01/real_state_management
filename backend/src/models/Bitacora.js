import mongoose from "mongoose"

const bitacoraSchema = new mongoose.Schema(
    {
        entidad: {
            type: String,
            required: true,
            enum: ["PROPIEDAD", "VISITA", "SOLICITUD"]
        },
        entidadId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        accion: {
            type: String,
            required: true,
            enum: ["CREACION", "CAMBIO_ESTADO", "RESERVA", "LIBERACION_RESERVA", "ELIMINACION"]
        },
        estadoAnterior: {
            type: String,
            required: false
        },
        estadoNuevo: {
            type: String,
            required: false
        },
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        observacion: {
            type: String,
            required: false,
            trim: true
        },
        fecha: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        // Without timestamps: Bitacora is insert-only, never updated, so updatedAt is not needed.
        // "fecha" field registers when the action is created.
        collection: "bitacora"
    }
)

bitacoraSchema.index({ entidad: 1, entidadId: 1, fecha: -1 })

export default mongoose.model("Bitacora", bitacoraSchema)