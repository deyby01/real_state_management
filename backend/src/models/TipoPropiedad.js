import mongoose from "mongoose";

const tipoPropiedadSchema = new mongoose.Schema(
    // name of fields
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
    // timestamps is for dates like 'createdAt' and 'updatedAt'
    // collection is added 'cause without this mongos creates tipopropiedades
    {
        timestamps: true,
        collection: "tiposPropiedad"
    }
)

export default mongoose.model("TipoPropiedad", tipoPropiedadSchema)