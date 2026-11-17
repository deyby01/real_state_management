/**
 * API client: the only place where the frontend talks to the backend.
 * Every service (auth, propiedades, visitas...) calls apiFetch instead of fetch,
 * so the base URL, the JSON headers, the token and the error handling are the
 * same everywhere.
 */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"

// localStorage key for the JWT. Kept here because apiFetch needs it on every call
const CLAVE_TOKEN = "gup_token"

/** Returns the stored JWT, or null when there is no session. */
export const obtenerToken = () => localStorage.getItem(CLAVE_TOKEN)

/** Stores the JWT after a successful login. */
export const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token)

/** Removes the JWT (logout or expired session). */
export const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN)

/**
 * Error thrown by apiFetch when the API answers with a non-2xx status.
 * `mensaje` is the Spanish message sent by the backend, ready to show to the user.
 */
export class ApiError extends Error {
    constructor(mensaje, status, datos = null) {
        super(mensaje)
        this.name = "ApiError"
        this.status = status // 0 means the server could not be reached
        this.datos = datos   // the full response body, e.g. estadosValidos on a 400
    }
}

/**
 * Builds a query string from an object, skipping empty values.
 * { comuna: "Ñuñoa", precioMin: "" } → "?comuna=%C3%91u%C3%B1oa"
 *
 * @param {Object} [params] - Filters to send in the URL.
 * @returns {string} The query string with its "?", or "" when there is nothing to send.
 */
const crearQuery = (params) => {
    if (!params) return ""
    const query = new URLSearchParams()
    for (const [clave, valor] of Object.entries(params)) {
        if (valor !== undefined && valor !== null && valor !== "") query.append(clave, valor)
    }
    const texto = query.toString()
    return texto ? `?${texto}` : ""
}

/**
 * Calls the API and returns the parsed JSON body.
 *
 * @param {string} ruta - Path after /api, e.g. "/catalogo" or "/propiedades/123/estado".
 * @param {Object} [opciones]
 * @param {string} [opciones.method="GET"] - HTTP method.
 * @param {Object} [opciones.body] - Sent as JSON.
 * @param {Object} [opciones.params] - Sent as query string (empty values are skipped).
 * @returns {Promise<any>} The response body.
 * @throws {ApiError} When the server answers with an error or cannot be reached.
 */
export const apiFetch = async (ruta, { method = "GET", body, params } = {}) => {
    const token = obtenerToken()

    let respuesta
    try {
        respuesta = await fetch(`${API_URL}${ruta}${crearQuery(params)}`, {
            method,
            headers: {
                ...(body !== undefined && { "Content-Type": "application/json" }),
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
    } catch {
        // fetch only rejects on network problems: backend down, wrong URL or CORS
        throw new ApiError("No se pudo conectar con el servidor", 0)
    }

    // Some responses may have no body; a parse error must not hide the real status
    const datos = await respuesta.json().catch(() => null)

    if (!respuesta.ok) {
        // An invalid or expired token: let the auth context close the session
        if (respuesta.status === 401 && token) {
            window.dispatchEvent(new Event("gup:sesion-expirada"))
        }
        throw new ApiError(datos?.mensaje ?? "Ocurrió un error inesperado", respuesta.status, datos)
    }

    return datos
}