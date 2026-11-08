import mongoose from "mongoose";

const propiedadSchema = new mongoose.Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        tipoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TipoPropiedad",
            required: true
        },
        propietarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propietario",
            required: true
        },
        ejecutivoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        direccion: {
            calle:  { type: String, required: true, trim: true },
            numero: { type: String, trim: true },
            comuna: { type: String, required: true, trim: true },
            ciudad: { type: String, required: true, trim: true },
        },
        superficie: {
            type: Number,
            required: true,
            min: 1
        },
        dormitorios: {
            type: Number,
            min: 0
        },
        banos: {
            type: Number,
            min: 0
        },
        estacionamientos: {
            type: Number,
            min: 0
        },
        valorArriendo: {
            type: Number,
            required: true,
            min: 1
        },
        gastosComunes: {
            type: Number,
            min: 0
        },
        caracteristicas: {
            type: [String],
            default: []
        },
        imagenes: [
            {
                url: { type: String, required: true, trim: true },
                orden: {type: Number, default: 0}
            }
        ],
        estado: {
            type: String,
            required: true,
            enum: ["DISPONIBLE", "PUBLICADA", "RESERVADA", "ARRENDADA", "EN_MANTENCION", "INACTIVA"],
            default: "DISPONIBLE"
        },
        destacada: {
            type: Boolean,
            default: false
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "propiedades"
    }
)

propiedadSchema.index({ estado: 1, "direccion.comuna": 1, tipoId: 1, valorArriendo: 1 })
propiedadSchema.index({ propietarioId: 1 })

export default mongoose.model("Propiedad", propiedadSchema)