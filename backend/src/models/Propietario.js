/**
 * Owner business records stored in the `propietarios` collection (RF2).
 * Spec: docs/DATA_MODEL.md#propietarios-property-owners.
 * Login accounts are stored separately in Usuario and linked by propietarioId (D1).
 */
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
            // Normalize before uniqueness checks; missing values reach the required validator.
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

        // Soft deletion preserves the owner record and historical references (RNF-10).
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
