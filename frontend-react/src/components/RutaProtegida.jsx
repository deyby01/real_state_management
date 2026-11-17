import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

/**
 * Layout route that only lets a logged-in user with an allowed role through.
 * Use it to wrap a group of routes in App.jsx:
 *
 *   <Route element={<RutaProtegida roles={["EJECUTIVO"]} />}>
 *       <Route path="/panel/propiedades" element={<PropiedadesPanel />} />
 *   </Route>
 *
 * This is a UI convenience only: the real protection is verificarToken and
 * permitirRoles in the backend, which answer 401/403 no matter what the page shows.
 *
 * - While the stored token is being checked (`cargando`), it renders nothing,
 *   so a reload does not bounce the user to /login.
 * - No session → /login, remembering the page in `state.desde` to come back after login.
 * - Wrong role → home page.
 *
 * @param {Object} props
 * @param {string[]} [props.roles] - Allowed roles. Omit it to allow any logged-in user.
 */
export default function RutaProtegida({ roles }) {
    const { usuario, cargando } = useAuth()
    const ubicacion = useLocation()

    if (cargando) return null

    if (!usuario) {
        return <Navigate to="/login" replace state={{ desde: ubicacion }} />
    }

    if (roles && !roles.includes(usuario.rol)) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
