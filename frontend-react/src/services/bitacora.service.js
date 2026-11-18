/**
 * Calls to /api/bitacora: the audit log (RN-13), ADMIN only. It is insert-only:
 * there is nothing to create, edit or delete from the frontend (rule 12).
 * Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * GET /api/bitacora: entries newest first, with `usuarioId` (`nombre email rol`).
 *
 * @param {Object} [filtros] - entidad ("PROPIEDAD" | "VISITA" | "SOLICITUD"), entidadId.
 * @returns {Promise<Object[]>} 400 on an invalid entidadId.
 */
export const listarBitacora = (filtros = {}) => apiFetch("/bitacora", { params: filtros })
