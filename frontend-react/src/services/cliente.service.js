/**
 * Calls to /api/clientes: client management for the executive (CU5).
 * The whole router is EJECUTIVO only; other roles get 403. Errors are ApiError (see api.js).
 */

import { apiFetch } from "./api"

/**
 * GET /api/clientes: active clients only, no filters.
 *
 * @returns {Promise<Object[]>} rut, nombre, email, telefono, ciudad, comuna, estado, activo.
 */
export const listarClientes = () => apiFetch("/clientes")

/**
 * GET /api/clientes/:id. The detail also returns an inactive client, because it is
 * read-only history.
 *
 * @param {string} id
 * @returns {Promise<Object>} 400 on a malformed id, 404 if it does not exist.
 */
export const obtenerCliente = (id) => apiFetch(`/clientes/${id}`)

/**
 * POST /api/clientes. A new client is always INTERESADO and active: `estado`, `activo`
 * and `_id` are set by the server, never by the form. The RUT is normalized by the
 * backend, so `19.876.543-2` is stored as `19876543-2`.
 *
 * @param {Object} datos - rut, nombre, email, telefono, ciudad, comuna.
 * @returns {Promise<Object>} The created client. 400 on invalid data, 409 on a
 *   duplicate RUT or email.
 */
export const crearCliente = (datos) => apiFetch("/clientes", { method: "POST", body: datos })

/**
 * PUT /api/clientes/:id. Partial update: only the fields sent change. `estado` and
 * `activo` are ignored by the server, and an inactive client answers 404, so it
 * cannot be edited back to life.
 *
 * @param {string} id
 * @param {Object} datos - Any subset of rut, nombre, email, telefono, ciudad, comuna.
 * @returns {Promise<Object>} The updated client. 400 on invalid data, 404 if it does
 *   not exist or is inactive, 409 on a duplicate RUT or email.
 */
export const actualizarCliente = (id, datos) => apiFetch(`/clientes/${id}`, { method: "PUT", body: datos })

/**
 * DELETE /api/clientes/:id (soft delete): the document stays in the collection with
 * `activo: false` and disappears from the list.
 *
 * @param {string} id
 * @returns {Promise<Object>} The deactivated client. 404 if it was already deleted or
 *   does not exist, which is why deleting twice is not idempotent.
 */
export const eliminarCliente = (id) => apiFetch(`/clientes/${id}`, { method: "DELETE" })
