/**
 * Session state for the whole app: who is logged in, login and logout.
 * Wrap the app with <AuthProvider> once (main.jsx) and read it anywhere with useAuth().
 * The token lives in localStorage (see services/api.js), so a page reload keeps
 * the session; on load it is validated against GET /auth/me.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { borrarToken, guardarToken, obtenerToken } from "../services/api"
import { iniciarSesion, obtenerUsuarioActual } from "../services/auth.service"

const AuthContext = createContext(null)

/**
 * Provides `usuario`, `cargando`, `login` and `logout` to every component below it.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The app.
 */
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    // True until the stored token is checked, so protected pages do not redirect
    // to /login during the first instant after a reload
    const [cargando, setCargando] = useState(() => Boolean(obtenerToken()))

    const logout = useCallback(() => {
        borrarToken()
        setUsuario(null)
    }, [])

    // On load: a stored token may be expired or belong to a deactivated user,
    // so the session is restored only if the API still accepts it
    useEffect(() => {
        if (!obtenerToken()) return
        obtenerUsuarioActual()
            .then(setUsuario)
            .catch(logout)
            .finally(() => setCargando(false))
    }, [logout])

    // apiFetch emits this event when the API answers 401 to a request with a token
    useEffect(() => {
        window.addEventListener("gup:sesion-expirada", logout)
        return () => window.removeEventListener("gup:sesion-expirada", logout)
    }, [logout])

    /**
     * Logs in and stores the token. Errors (ApiError) are thrown to the form,
     * which shows `error.message` to the user.
     *
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} The logged-in user (with `rol`), to decide where to redirect.
     */
    const login = async (email, password) => {
        const { token, usuario } = await iniciarSesion(email, password)
        guardarToken(token)
        setUsuario(usuario)
        return usuario
    }

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Reads the session from any component: const { usuario, login, logout } = useAuth()
 *
 * @returns {{ usuario: Object|null, cargando: boolean, login: Function, logout: Function }}
 */
export function useAuth() {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>")
    }
    return contexto
}