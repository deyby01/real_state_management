import mongoose from "mongoose"

/**
 * Visita model: real estate visit requests (collection `visitas`).
 * Spec: docs/DATA_MODEL.md → `visitas` and state machine §6.3.
 * Related requirements: RN-10 (overlap check, controller), RN-13 (audit log),
 * D8 (fixed duration). RN-16 (published property) and D10 (executive copy)
 * are enforced by the controller after the property refactor.
 *
 * The state machine (§6.3) defines the allowed transitions; a new visit
 * always starts as SOLICITADA. No `activo` field is used: per DATA_MODEL,
 * visits are voided using CANCELADA status rather than soft deletion.
 */

// Allowed visit states (§6.3); transitions live in TRANSICIONES in visita.controller.js
export const ESTADOS_VISITA = ["SOLICITADA", "CONFIRMADA", "REALIZADA", "RECHAZADA", "CANCELADA"]

// Decision D8: fixed duration of 1 hour for all visits (in milliseconds)
export const DURACION_VISITA_MS = 60 * 60 * 1000

const visitaSchema = new mongoose.Schema(
    {
        propiedadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Propiedad",
            required: true
        },
        // Reference to an existing, active client; the controller validates it on creation
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
                    // Guard: only validate future date on creation or rescheduling.
                    // Allows saving past visits when updating status (e.g. marking REALIZADA).
                    if (!this.isNew && !this.isModified("fechaInicio")) return true
                    return valor > new Date()
                },
                message: "La fecha de inicio debe ser futura"
            }
        },
        // Set by the pre-validate hook below; never accepted from the client
        fechaFin: {
            type: Date,
            required: true
        },
        observaciones: {
            type: String,
            required: false,
            trim: true
        },
        // A new visit always starts as SOLICITADA; the controller enforces the transitions (§6.3)
        estado: {
            type: String,
            required: true,
            enum: ESTADOS_VISITA,
            default: "SOLICITADA"
        },
        // Written by the executive after the visit; PATCH /resultado moves CONFIRMADA → REALIZADA
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

// D8: overwrites any fechaFin sent by the client, so every visit lasts exactly
// DURACION_VISITA_MS. Runs before validation because fechaFin is required.
visitaSchema.pre("validate", function () {
    if (this.fechaInicio instanceof Date && !isNaN(this.fechaInicio.getTime())) {
        this.fechaFin = new Date(this.fechaInicio.getTime() + DURACION_VISITA_MS)
    }
})

// Compound index supporting chronological agenda queries and overlap detection (RN-10)
visitaSchema.index({ ejecutivoId: 1, fechaInicio: 1, fechaFin: 1 })

export default mongoose.model("Visita", visitaSchema)