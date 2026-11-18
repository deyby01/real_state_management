/**
 * Calls to /api/mis-propiedades: the logged-in owner's properties (RNF-07).
 * The owner comes from the token (`usuarios.propietarioId`), never from the request.
 * Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/mis-propiedades: the owner's active properties in every state, with
 * `tipoId` and the executive's `nombre email`.
 *
 * @returns {Promise<Object[]>} 409 if the account is not linked to an owner record.
 */
export const listarMisPropiedades = () => apiFetch("/mis-propiedades")
