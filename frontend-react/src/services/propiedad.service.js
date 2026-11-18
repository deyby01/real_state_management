/**
 * Calls to /api/propiedades: property management for the executive (CU3).
 * The whole router is EJECUTIVO only; other roles get 403. Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/propiedades: active properties, newest first, with `tipoId`,
 * `ejecutivoId` and `propietarioId` populated.
 *
 * @param {Object} [filtros] - estado, ejecutivoId. Empty values are not sent.
 * @returns {Promise<Object[]>}
 */
export const listarPropiedades = (filtros = {}) => apiFetch("/propiedades", { params: filtros })

/**
 * GET /api/propiedades/:id.
 *
 * @param {string} id
 * @returns {Promise<Object>} 404 if it does not exist or was deleted.
 */
export const obtenerPropiedad = (id) => apiFetch(`/propiedades/${id}`)

/**
 * POST /api/propiedades. The new property is always DISPONIBLE and belongs to the
 * logged-in executive (the server sets `estado` and `ejecutivoId`).
 *
 * @param {Object} datos - titulo, tipoId, propietarioId, direccion, superficie, dormitorios,
 *   banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada.
 * @returns {Promise<{ mensaje: string, propiedad: Object }>} 400 on invalid data, type or owner.
 */
export const crearPropiedad = (datos) => apiFetch("/propiedades", { method: "POST", body: datos })

/**
 * PUT /api/propiedades/:id. Only the fields sent change; `estado`, `ejecutivoId`,
 * `propietarioId` and `activo` are ignored by the server. `direccion` goes complete.
 *
 * @param {string} id
 * @param {Object} datos
 * @returns {Promise<{ mensaje: string, propiedad: Object }>}
 */
export const actualizarPropiedad = (id, datos) => apiFetch(`/propiedades/${id}`, { method: "PUT", body: datos })

/**
 * DELETE /api/propiedades/:id (soft delete).
 *
 * @param {string} id
 * @returns {Promise<{ mensaje: string }>} 409 if RESERVADA or ARRENDADA.
 */
export const eliminarPropiedad = (id) => apiFetch(`/propiedades/${id}`, { method: "DELETE" })

/**
 * PATCH /api/propiedades/:id/estado, following the backend's TRANSICIONES table.
 *
 * @param {string} id
 * @param {string} estado - Target state, e.g. "PUBLICADA".
 * @param {string} [observacion] - Saved in the audit log.
 * @returns {Promise<{ mensaje: string, propiedad: Object }>} 409 if the transition is not allowed.
 */
export const cambiarEstadoPropiedad = (id, estado, observacion) =>
    apiFetch(`/propiedades/${id}/estado`, { method: "PATCH", body: { estado, observacion } })
