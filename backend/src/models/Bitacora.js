import mongoose from "mongoose"

/**
 * Bitacora model: audit log of relevant operations (collection `bitacora`).
 * Spec: docs/DATA_MODEL.md → `bitacora`. Requirements: RN-13, RNF-12.
 *
 * Insert-only (rule 12): entries are never updated or deleted, so it has no
 * `activo` field. Entries are created through services/bitacora.service.js.
 */
const bitacoraSchema = new mongoose.Schema(
    {
        entidad: {
            type: String,
            required: true,
            enum: ["PROPIEDAD", "VISITA", "SOLICITUD"]
        },
        // No `ref`: it may point to a property, a visit or a request.
        // `entidad` says which collection to look in (polymorphic reference)
        entidadId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        // Closed list, so a typo such as "cambio_estado" is rejected instead of stored.
        // A teammate who needs a new action asks the owner of this model to add it
        accion: {
            type: String,
            required: true,
            enum: ["CREACION", "CAMBIO_ESTADO", "RESERVA", "LIBERACION_RESERVA", "ELIMINACION"]
        },
        // Empty on CREACION. Equal to estadoNuevo on ELIMINACION (only `activo` changes)
        estadoAnterior: {
            type: String,
            required: false
        },
        estadoNuevo: {
            type: String,
            required: false
        },
        // Who performed the operation (req.usuario._id, set by verificarToken)
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
        // Date.now without parentheses: Mongoose calls it for every new entry
        fecha: {
            type: Date,
            default: Date.now,
            required: true
        }
    },
    {
        // No timestamps (a documented exception to the project convention): an
        // insert-only document is never updated, so updatedAt would be meaningless.
        // `fecha` records when the entry was created.
        collection: "bitacora"
    }
)

// History of one document, newest first: GET /api/bitacora?entidad=...&entidadId=...
bitacoraSchema.index({ entidad: 1, entidadId: 1, fecha: -1 })

export default mongoose.model("Bitacora", bitacoraSchema)