import mongoose from "mongoose";

/**
 * TipoPropiedad model: catalog of property types (collection `tiposPropiedad`).
 * Spec: docs/DATA_MODEL.md → `tiposPropiedad`.
 *
 * Types live in their own collection (decision D4), so new ones can be added
 * without changing the code (RN-E). Reference MVC flow for the whole team.
 */
const tipoPropiedadSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    // timestamps adds createdAt and updatedAt. The explicit collection name avoids
    // Mongoose's English pluralization ("tipopropiedads") (rule 13)
    {
        timestamps: true,
        collection: "tiposPropiedad"
    }
)

export default mongoose.model("TipoPropiedad", tipoPropiedadSchema)