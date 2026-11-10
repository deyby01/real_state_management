import mongoose from "mongoose";

/**
 * Usuario model: login accounts and their role (collection `usuarios`).
 * Spec: docs/DATA_MODEL.md → `usuarios`.
 *
 * The account is kept apart from the business person (decision D1): an owner or a
 * client user points to its `propietarios` / `clientes` record through
 * `propietarioId` / `clienteId`.
 */
const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        // Unique and lowercase, so "Ana@GUP.cl" and "ana@gup.cl" are the same account
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true
        },
        // bcrypt hash, never the plain password. Hidden from every query unless it is
        // requested with .select("+passwordHash"), which only the login does (rule 16)
        passwordHash: {
            type: String, 
            required: true,
            select: false
        },
        // Public registration always gets the default; other roles are created by an
        // admin or by the fixtures, never taken from the request body (rule 17)
        rol: {
            type: String,
            required: true,
            enum: ["ADMIN", "EJECUTIVO", "PROPIETARIO", "CLIENTE"],
            default: "CLIENTE"
        },
        // Only for PROPIETARIO users: lets an owner see only their own properties (RNF-07)
        propietarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propietario",
            default: null
        },
        // Only for CLIENTE users: links the account to its client record
        clienteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cliente",
            default: null
        },
        // Soft delete: an inactive user cannot log in (rule 18)
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