/**
 * Calls to /api/auth. Reference service: every model gets one file like this
 * (services/<modelo>.service.js), and pages call these functions instead of
 * writing routes and methods by hand. Errors are ApiError (see api.js).
 */
import { apiFetch } from "./api"

/**
 * POST /api/auth/login.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, usuario: Object }>} 401 "Credenciales inválidas" on failure.
 */
export const iniciarSesion = (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } })

/**
 * GET /api/auth/me: the user of the stored token.
 *
 * @returns {Promise<Object>} `_id`, `nombre`, `email`, `rol`. 401 if the token is no longer valid.
 */
export const obtenerUsuarioActual = () => apiFetch("/auth/me")
