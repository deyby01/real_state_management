/**
 * Visit states on screen. Stored values are uppercase constants (rule 9);
 * labels and colors are added here only.
 */
export const ESTADOS_VISITA = {
    SOLICITADA: { texto: "Solicitada", clase: "bg-sky-100 text-sky-800" },
    CONFIRMADA: { texto: "Confirmada", clase: "bg-emerald-100 text-emerald-800" },
    REALIZADA: { texto: "Realizada", clase: "bg-indigo-100 text-indigo-800" },
    RECHAZADA: { texto: "Rechazada", clase: "bg-stone-200 text-stone-700" },
    CANCELADA: { texto: "Cancelada", clase: "bg-amber-100 text-amber-900" },
}

/** Values accepted by GET /api/visitas?estado= (same as backend ESTADOS_VISITA). */
export const VALORES_ESTADO = Object.keys(ESTADOS_VISITA)

/**
 * Buttons to show per state (mirror of backend TRANSICIONES + UI only).
 * Reprogramar is not a state change: it is handled in VisitaForm (step F4).
 */
export const ACCIONES_POR_ESTADO = {
    SOLICITADA: ["confirmar", "rechazar", "cancelar", "reprogramar"],
    CONFIRMADA: ["resultado", "cancelar", "reprogramar"],
    REALIZADA: [],
    RECHAZADA: [],
    CANCELADA: [],
}
