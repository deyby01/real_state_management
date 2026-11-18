/**
 * Property states on screen. The stored value is the constant (rule 9); only the
 * label and the color are added here.
 */
export const ESTADOS_PROPIEDAD = {
    DISPONIBLE: { texto: "Disponible", clase: "bg-sky-100 text-sky-800" },
    PUBLICADA: { texto: "Publicada", clase: "bg-emerald-100 text-emerald-800" },
    RESERVADA: { texto: "Reservada", clase: "bg-amber-100 text-amber-800" },
    ARRENDADA: { texto: "Arrendada", clase: "bg-orange-100 text-orange-800" },
    EN_MANTENCION: { texto: "En mantención", clase: "bg-violet-100 text-violet-800" },
    INACTIVA: { texto: "Inactiva", clase: "bg-stone-200 text-stone-700" },
}

/**
 * Copy of TRANSICIONES in backend/src/controllers/propiedad.controller.js, used
 * only to offer the valid options. The backend is the authority: if both tables
 * ever differ, it answers 409 and the page shows its message. RESERVADA never
 * appears as a target: it only comes from approving a rental request (RN-14).
 */
export const TRANSICIONES = {
    DISPONIBLE: ["PUBLICADA", "EN_MANTENCION", "INACTIVA"],
    PUBLICADA: ["DISPONIBLE", "EN_MANTENCION", "INACTIVA"],
    RESERVADA: ["ARRENDADA"],
    ARRENDADA: ["DISPONIBLE", "EN_MANTENCION", "INACTIVA"],
    EN_MANTENCION: ["DISPONIBLE", "INACTIVA"],
    INACTIVA: ["DISPONIBLE"],
}
