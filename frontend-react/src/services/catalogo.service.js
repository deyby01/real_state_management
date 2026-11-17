/**
 * Calls to the public catalog (/api/catalogo). No token needed: only PUBLICADA
 * properties, and never the owner's data (RNF-08). Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/catalogo with optional filters. Empty filters are not sent.
 *
 * @param {Object} [filtros] - comuna, tipo (_id), precioMin, precioMax, dormitorios, banos.
 * @returns {Promise<Object[]>} Published properties, newest first. 400 on an invalid filter.
 */
export const listarCatalogo = (filtros = {}) => apiFetch("/catalogo", { params: filtros })

/**
 * GET /api/catalogo/:id: one published property, with `tipoId.nombre`.
 *
 * @param {string} id - Property _id.
 * @returns {Promise<Object>} 404 if it is not published (reserved, rented, deleted), 400 on an invalid id.
 */
export const obtenerPropiedadCatalogo = (id) => apiFetch(`/catalogo/${id}`)
