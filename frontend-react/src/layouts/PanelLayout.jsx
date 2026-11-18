import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { MENU_POR_ROL, ROLES, iniciales } from "./menuPanel"

const claseEnlace = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors duration-300 ${
        isActive ? "bg-smoke-100 text-ink" : "text-smoke-100 hover:bg-smoke-700"
    }`

/**
 * Frame of every /panel page: a top bar (user, back to the site, logout) and a
 * sidebar with the links of the user's role (see menuPanel.js). The page itself
 * is drawn in <Outlet />. On mobile the sidebar becomes a horizontal bar.
 *
 * It must be rendered inside <RutaProtegida>, so `usuario` is never null here.
 */
export default function PanelLayout() {
    const { usuario, logout } = useAuth()
    const navegar = useNavigate()
    const menu = MENU_POR_ROL[usuario.rol] ?? []

    const cerrarSesion = () => {
        logout()
        navegar("/login", { replace: true })
    }

    return (
        <div className="min-h-screen bg-canvas text-ink flex flex-col">
            <header className="bg-smoke-900 text-smoke-100">
                <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img className="h-12" src="/logo-gup-nav-sin-fondo.png" alt="logo-gup" />
                        <span className="hidden sm:inline font-semibold">Panel GUP</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/panel/perfil" title="Mi perfil" className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-smoke-700 transition-colors duration-300">
                            <div className="text-right leading-tight">
                                <p className="font-semibold">{usuario.nombre}</p>
                                <p className="text-xs text-smoke-300">{ROLES[usuario.rol]?.texto ?? usuario.rol}</p>
                            </div>
                            <span className="w-9 h-9 rounded-full bg-smoke-100 text-smoke-900 text-sm font-bold flex items-center justify-center">
                                {iniciales(usuario.nombre)}
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={cerrarSesion}
                            className="py-2 px-3 rounded-lg text-sm hover:bg-danger transition-colors duration-300 cursor-pointer"
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span className="hidden sm:inline ml-2">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row">
                <nav className="bg-smoke-900 md:w-60 p-3 flex md:flex-col gap-1 overflow-x-auto">
                    <NavLink to="/panel" end className={claseEnlace}>
                        <i className="fa-solid fa-gauge w-5 text-center"></i>
                        Inicio
                    </NavLink>
                    {menu.map((item) => (
                        <NavLink key={item.ruta} to={item.ruta} className={claseEnlace}>
                            <i className={`${item.icono} w-5 text-center`}></i>
                            {item.texto}
                        </NavLink>
                    ))}
                    {/* Every role has a profile, so it is not part of MENU_POR_ROL */}
                    <span className="hidden md:block h-px bg-smoke-700 my-2" aria-hidden="true"></span>
                    <NavLink to="/panel/perfil" className={claseEnlace}>
                        <i className="fa-solid fa-id-card w-5 text-center"></i>
                        Mi perfil
                    </NavLink>
                </nav>

                <main className="flex-1 p-4 md:p-8 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
