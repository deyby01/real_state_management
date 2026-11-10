import mongoose from "mongoose";

const propietarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        rut: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            set: valor => typeof valor === "string"
                ? valor.replaceAll(".", "")
                : valor
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        telefono: {
            type: String,
            trim: true
        },

        activo: {
            type: Boolean,
            default: true,
        },
    },

    {
        timestamps: true,
        collection: "propietarios"
    }
);

export default mongoose.model("Propietario", propietarioSchema);
