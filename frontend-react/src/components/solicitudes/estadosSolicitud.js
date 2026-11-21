/**
 * Rental request states on screen. The stored value is the constant (rule 9);
 * only the label and the color are added here.
 */
export const ESTADOS_SOLICITUD = {
    PENDIENTE: { texto: "Pendiente", clase: "bg-sky-100 text-sky-800" },
    EN_EVALUACION: { texto: "En evaluación", clase: "bg-amber-100 text-amber-800" },
    APROBADA: { texto: "Aprobada", clase: "bg-emerald-100 text-emerald-800" },
    RECHAZADA: { texto: "Rechazada", clase: "bg-red-100 text-red-800" },
    CANCELADA: { texto: "Cancelada", clase: "bg-stone-200 text-stone-700" },
}

/**
 * State changes the executive may request, copied from
 * backend/src/controllers/solicitudArriendo.controller.js. It is only used to show
 * the buttons; the backend is the authority and answers 409 to any other change.
 */
export const ACCIONES_SOLICITUD = {
    PENDIENTE: ["evaluar", "cancelar"],
    EN_EVALUACION: ["aprobar", "rechazar"],
    APROBADA: ["cancelar"],
    RECHAZADA: [],
    CANCELADA: [],
}

/** Label and icon of each state change, used by the buttons and the action dialog. */
export const ETIQUETAS_ACCION = {
    evaluar: { texto: "Evaluar", icono: "fa-solid fa-magnifying-glass" },
    aprobar: { texto: "Aprobar", icono: "fa-solid fa-check" },
    rechazar: { texto: "Rechazar", icono: "fa-solid fa-xmark" },
    cancelar: { texto: "Cancelar", icono: "fa-solid fa-ban" },
}
