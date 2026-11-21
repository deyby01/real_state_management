import { apiFetch } from "./api"

/**
 * Returns active owners. Requires an EJECUTIVO session.
 * @returns {Promise<Object[]>} The active owner records.
 */
export const listarPropietarios = () => apiFetch("/propietarios")

/**
 * Returns one active owner by ID. Requires an EJECUTIVO session.
 * @param {string} id - The owner's MongoDB identifier.
 * @returns {Promise<Object>} The owner record.
 */
export const obtenerPropietario = (id) =>
    apiFetch(`/propietarios/${id}`)

/**
 * Creates an owner. Requires an EJECUTIVO session.
 * @param {Object} datos - rut, nombre, email and optional telefono.
 * @returns {Promise<Object>} The created owner record.
 */
export const crearPropietario = (datos) =>
    apiFetch("/propietarios", {
        method: "POST",
        body: datos
    })

/**
 * Updates an active owner. Requires an EJECUTIVO session.
 * @param {string} id - The owner's MongoDB identifier.
 * @param {Object} datos - Editable fields to update.
 * @returns {Promise<Object>} The updated owner record.
 */
export const actualizarPropietario = (id, datos) =>
    apiFetch(`/propietarios/${id}`, {
        method: "PUT",
        body: datos
    })

/**
 * Soft-deletes an owner. Requires an EJECUTIVO session.
 * @param {string} id - The owner's MongoDB identifier.
 * @returns {Promise<Object>} The message and inactive owner record.
 */
export const eliminarPropietario = (id) =>
    apiFetch(`/propietarios/${id}`, {
        method: "DELETE"
    })