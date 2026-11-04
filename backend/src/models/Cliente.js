import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema(
    {
        rut: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        nombre: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        telefono: {
            type: String,
            trim: true,
        },

        ciudad: {
            type: String,
            trim: true,
        },

        comuna: {
            type: String,
            trim: true,
        },

        estado: {
            type: String,
            enum: ["INTERESADO", "ARRENDATARIO"],
            default: "INTERESADO",
        },

        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "clientes"
    }
)

export default mongoose.model("Cliente", clienteSchema)