/**
 * Calls to /api/solicitudes: rental requests (CU8 client, CU9 executive).
 * A client only sees and cancels their own requests; an executive only the ones
 * assigned to them (the backend decides from the token). Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/solicitudes: the requests visible to the logged-in user, newest first,
 * with `propiedadId` and `clienteId` populated.
 *
 * @returns {Promise<Object[]>}
 */
export const listarSolicitudes = () => apiFetch("/solicitudes")

/**
 * GET /api/solicitudes/:id.
 *
 * @param {string} id
 * @returns {Promise<Object>} 404 when it does not exist or is not yours.
 */
export const obtenerSolicitud = (id) => apiFetch(`/solicitudes/${id}`)

/**
 * POST /api/solicitudes. The client and the executive come from the token and the
 * property (never from the body); the request starts PENDIENTE.
 *
 * @param {Object} datos
 * @param {string} datos.propiedadId - A PUBLICADA property.
 * @param {Object} datos.antecedentes - ingresosMensuales, ocupacion, numeroOcupantes, tieneMascotas.
 * @returns {Promise<Object>} 201 · 409 when the account has no client profile or the property is not PUBLISHED.
 */
export const crearSolicitud = (datos) => apiFetch("/solicitudes", { method: "POST", body: datos })

/**
 * PATCH /api/solicitudes/:id/evaluar (assigned executive).
 * PENDIENTE -> EN_EVALUACION.
 *
 * @param {string} id
 * @param {string} [observacion] - Appended to the request's notes.
 * @returns {Promise<Object>} 409 on an invalid transition.
 */
export const evaluarSolicitud = (id, observacion) =>
    apiFetch(`/solicitudes/${id}/evaluar`, { method: "PATCH", body: { observacion } })

/**
 * PATCH /api/solicitudes/:id/aprobar (assigned executive).
 * EN_EVALUACION -> APROBADA and the property becomes RESERVADA.
 *
 * @param {string} id
 * @param {string} [observacion]
 * @returns {Promise<Object>} 409 on an invalid transition, a second approval or a non-PUBLISHED property.
 */
export const aprobarSolicitud = (id, observacion) =>
    apiFetch(`/solicitudes/${id}/aprobar`, { method: "PATCH", body: { observacion } })

/**
 * PATCH /api/solicitudes/:id/rechazar (assigned executive).
 * EN_EVALUACION -> RECHAZADA.
 *
 * @param {string} id
 * @param {string} [observacion]
 * @returns {Promise<Object>} 409 on an invalid transition.
 */
export const rechazarSolicitud = (id, observacion) =>
    apiFetch(`/solicitudes/${id}/rechazar`, { method: "PATCH", body: { observacion } })

/**
 * PATCH /api/solicitudes/:id/cancelar.
 * CLIENTE: PENDIENTE -> CANCELADA. EJECUTIVO: PENDIENTE or APROBADA -> CANCELADA;
 * cancelling an approved request releases the property back to PUBLICADA.
 *
 * @param {string} id
 * @param {string} [observacion]
 * @returns {Promise<Object>} 409 on an invalid transition.
 */
export const cancelarSolicitud = (id, observacion) =>
    apiFetch(`/solicitudes/${id}/cancelar`, { method: "PATCH", body: { observacion } })
