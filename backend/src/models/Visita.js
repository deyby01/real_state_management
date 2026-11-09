import mongoose from "mongoose"

// Constantes exportadas para reutilizar en controladores y pruebas
export const ESTADOS_VISITA = ["SOLICITADA", "CONFIRMADA", "REALIZADA", "RECHAZADA", "CANCELADA"]
export const DURACION_VISITA_MS = 60 * 60 * 1000 // 1 hora en milisegundos (D8)

const visitaSchema = new mongoose.Schema(
    {
        propiedadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propiedad",
            required: true
        },
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            required: true
        },
        ejecutivoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        fechaInicio: {
            type: Date,
            required: true,
            validate: {
                validator: function (valor) {
                    if (!this.isNew && !this.isModified("fechaInicio")) return true
                    return valor > new Date()
                },
                message: "La fecha de inicio debe ser futura"
            }
        },
        fechaFin: {
            type: Date,
            required: true
        },
        observaciones: {
            type: String,
            required: false,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            enum: ESTADOS_VISITA,
            default: "SOLICITADA"
        },
        resultado: {
            type: String,
            required: false,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "visitas"
    }
)

// D8: La duración siempre es de 1 hora. El hook calcula fechaFin antes de validar
visitaSchema.pre("validate", function () {
    if (this.fechaInicio instanceof Date && !isNaN(this.fechaInicio.getTime())) {
        this.fechaFin = new Date(this.fechaInicio.getTime() + DURACION_VISITA_MS)
    }
})

// Índice compuesto para acelerar búsquedas de agenda y chequeo de solapamientos (RN-10)
visitaSchema.index({ ejecutivoId: 1, fechaInicio: 1, fechaFin: 1 })

export default mongoose.model("Visita", visitaSchema)