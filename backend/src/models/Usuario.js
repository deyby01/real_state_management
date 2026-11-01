import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true
        },
        passwordHash: {
            type: String, 
            required: true,
            select: false
        },
        rol: {
            type: String,
            required: true,
            enum: ["ADMIN", "EJECUTIVO", "PROPIETARIO", "CLIENTE"],
            default: "CLIENTE"
        },
        propietarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propietario",
            default: null
        },
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            default: null
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "usuarios"
    }
)

export default mongoose.model("Usuario", usuarioSchema)