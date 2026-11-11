import mongoose from "mongoose"

/**
 * Cliente model: people interested in renting and current tenants (collection `clientes`).
 * Spec: docs/DATA_MODEL.md → `clientes` (RF6, RN-11).
 *
 * `rut` and `email` are unique on their own: the same client cannot be registered
 * twice by either identifier (RN-11). Mongoose validates in the application; the
 * indexes are the database-level guarantee, even when two requests arrive at once.
 * `estado` is the business situation; `activo` only says whether the record was
 * deactivated (soft delete, rule 11), so a client with history is never removed.
 */
const clienteSchema = new mongoose.Schema(
    {
        // Stored as 12345678-9 by the controller: dots removed, hyphen kept (RN-11)
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

        // Lowercased so Ana@Mail.cl and ana@mail.cl cannot be two different clients
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Optional: an executive can register a client by phone, without an account.
        // Not unique yet: RN-11 mentions phone as a duplicate signal, pending
        // validation with the professor.
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

        // Uppercase constants (rule 9); ARRENDATARIO only after a contract is signed
        estado: {
            type: String,
            enum: ["INTERESADO", "ARRENDATARIO"],
            default: "INTERESADO",
        },

        // Soft delete flag: DELETE /api/clientes/:id sets it to false, never removes
        activo: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,        // adds createdAt and updatedAt
        collection: "clientes"   // explicit name (rule 13): never rely on pluralization
    }
)

export default mongoose.model("Cliente", clienteSchema)
