/**
 * Calls to /api/tipo-propiedades. Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/tipo-propiedades: active property types. Public (the catalog filter needs it).
 *
 * @returns {Promise<{ _id: string, nombre: string }[]>}
 */
export const listarTiposPropiedad = () => apiFetch("/tipo-propiedades")
