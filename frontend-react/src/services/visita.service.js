/**
 * Calls to /api/visitas: executive visit agenda (CU7).
 * The whole router is EJECUTIVO only; other roles get 403. Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/visitas: visits sorted by fechaInicio ascending, with property, client and executive populated.
 *
 * @param {Object} [filtros] - estado, propiedadId, ejecutivoId, desde, hasta (ISO 8601). Empty values are not sent.
 * @returns {Promise<Object[]>}
 */
export const listarVisitas = (filtros = {}) => apiFetch("/visitas", { params: filtros })

/**
 * GET /api/visitas/:id.
 *
 * @param {string} id
 * @returns {Promise<Object>} 404 if not found.
 */
export const obtenerVisita = (id) => apiFetch(`/visitas/${id}`)

/**
 * POST /api/visitas. Duration is 1 hour server-side; estado is always SOLICITADA; ejecutivoId comes from the property (D10).
 *
 * @param {Object} datos - propiedadId, clienteId, fechaInicio (ISO string), observaciones (optional).
 * @returns {Promise<Object>} 201: the saved visit document.
 */
export const crearVisita = (datos) => apiFetch("/visitas", { method: "POST", body: datos })

/**
 * PUT /api/visitas/:id: reschedule while SOLICITADA or CONFIRMADA.
 *
 * @param {string} id
 * @param {Object} datos - fechaInicio (required), observaciones (optional).
 * @returns {Promise<Object>}
 */
export const reprogramarVisita = (id, datos) => apiFetch(`/visitas/${id}`, { method: "PUT", body: datos })

/**
 * PATCH /api/visitas/:id/confirmar (SOLICITADA → CONFIRMADA).
 *
 * @param {string} id
 * @param {string} [observacion] - Audit log note.
 * @returns {Promise<Object>}
 */
export const confirmarVisita = (id, observacion) =>
    apiFetch(`/visitas/${id}/confirmar`, {
        method: "PATCH",
        body: observacion !== undefined ? { observacion } : {},
    })

/**
 * PATCH /api/visitas/:id/rechazar (SOLICITADA → RECHAZADA).
 *
 * @param {string} id
 * @param {string} [observacion]
 * @returns {Promise<Object>}
 */
export const rechazarVisita = (id, observacion) =>
    apiFetch(`/visitas/${id}/rechazar`, {
        method: "PATCH",
        body: observacion !== undefined ? { observacion } : {},
    })

/**
 * PATCH /api/visitas/:id/cancelar (SOLICITADA | CONFIRMADA → CANCELADA).
 *
 * @param {string} id
 * @param {string} [observacion]
 * @returns {Promise<Object>}
 */
export const cancelarVisita = (id, observacion) =>
    apiFetch(`/visitas/${id}/cancelar`, {
        method: "PATCH",
        body: observacion !== undefined ? { observacion } : {},
    })

/**
 * PATCH /api/visitas/:id/resultado (CONFIRMADA → REALIZADA).
 *
 * @param {string} id
 * @param {string} resultado - Required non-empty string.
 * @param {string} [observacion]
 * @returns {Promise<Object>} 400 if resultado is missing or blank.
 */
export const registrarResultadoVisita = (id, resultado, observacion) =>
    apiFetch(`/visitas/${id}/resultado`, {
        method: "PATCH",
        body: { resultado, ...(observacion !== undefined && { observacion }) },
    })
