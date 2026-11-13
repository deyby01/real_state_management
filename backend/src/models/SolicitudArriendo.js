/**
 * `solicitudesArriendo` collection: formal rental requests and their evaluation.
 * Approving a request reserves its property, so RN-14 is enforced here with a
 * partial unique index. Field details: docs/DATA_MODEL.md -> 6.2 Rental request.
 */
import mongoose from "mongoose"

const antecedentesSchema = new mongoose.Schema(
    {
        ingresosMensuales: { type: Number, required: true, min: 0 },
        ocupacion: { type: String, required: true, trim: true },
        numeroOcupantes: { type: Number, required: true, min: 1 },
        tieneMascotas: { type: Boolean, default: false },
    },
    { _id: false }
)

const observacionSchema = new mongoose.Schema(
    {
        texto: { type: String, required: true, trim: true },
        usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
        fecha: { type: Date, default: Date.now },
    },
    { _id: false }
)

export const ESTADOS_SOLICITUD = [
    "PENDIENTE",
    "EN_EVALUACION",
    "APROBADA",
    "RECHAZADA",
    "CANCELADA",
]

const solicitudSchema = new mongoose.Schema(
    {
        propiedadId: { type: mongoose.Schema.Types.ObjectId, ref: "Propiedad", required: true },
        clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
        ejecutivoId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
        antecedentes: { type: antecedentesSchema, required: true },
        estado: { type: String, enum: ESTADOS_SOLICITUD, default: "PENDIENTE", required: true },
        observaciones: { type: [observacionSchema], default: [] },
    },
    { timestamps: true, collection: "solicitudesArriendo" }
)

solicitudSchema.index(
    { propiedadId: 1 },
    { unique: true, partialFilterExpression: { estado: "APROBADA" } }
)

export default mongoose.model("SolicitudArriendo", solicitudSchema)