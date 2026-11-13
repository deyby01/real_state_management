import mongoose from "mongoose";

/**
 * Propiedad model: the properties managed by the company (collection `propiedades`).
 * Spec: docs/DATA_MODEL.md → `propiedades` and state machine 6.1.
 *
 * Address and images are embedded (decision D3): they only exist for this property
 * and are always read with it. `estado` is the business situation; `activo` only
 * says whether the record was deleted (soft delete, rule 11).
 */
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
        // Every property has an owner (RN-D). Never exposed in the public catalog (RNF-08)
        propietarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propietario",
            required: true
        },
        // The executive in charge (RN-15): the logged-in executive who created it
        ejecutivoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        // Embedded object: replaced as a whole on update, so it is always sent complete.
        // `numero` is a String because of values like "1240-B" or "S/N"
        direccion: {
            calle:  { type: String, required: true, trim: true },
            numero: { type: String, trim: true },
            comuna: { type: String, required: true, trim: true },
            ciudad: { type: String, required: true, trim: true },
        },
        // min: 1 where 0 makes no sense (area, rent); min: 0 where 0 is a real value
        // (a commercial space with no bedrooms, a house with no common expenses)
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
        // Monthly rent in CLP, stored as a number (rule 10)
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
        // Only image URLs for now. `orden` decides which one is the cover
        imagenes: [
            {
                url: { type: String, required: true, trim: true },
                orden: {type: Number, default: 0}
            }
        ],
        // Allowed transitions: TRANSICIONES in controllers/propiedad.controller.js.
        // A new property is always DISPONIBLE; RESERVADA only comes from approving a request
        estado: {
            type: String,
            required: true,
            enum: ["DISPONIBLE", "PUBLICADA", "RESERVADA", "ARRENDADA", "EN_MANTENCION", "INACTIVA"],
            default: "DISPONIBLE"
        },
        // Feeds the "Destacados" block of the landing page
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

// Public catalog filters: state, comuna, type and price range (RNF-13)
propiedadSchema.index({ estado: 1, "direccion.comuna": 1, tipoId: 1, valorArriendo: 1 })
// An owner's "my properties" view
propiedadSchema.index({ propietarioId: 1 })

export default mongoose.model("Propiedad", propiedadSchema)