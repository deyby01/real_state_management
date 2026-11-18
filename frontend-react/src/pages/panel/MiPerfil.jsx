import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { MENU_POR_ROL, ROLES, iniciales } from "../../layouts/menuPanel"

/**
 * Profile page (/panel/perfil, any logged-in role): the account data from
 * GET /api/auth/me (name, email, role), what the role does and shortcuts to its
 * panel sections, so every user knows where to go after logging in.
 */
export default function MiPerfil() {
    const { usuario, logout } = useAuth()
    const navegar = useNavigate()
    const rol = ROLES[usuario.rol]
    const accesos = MENU_POR_ROL[usuario.rol] ?? []

    const cerrarSesion = () => {
        logout()
        navegar("/login", { replace: true })
    }

    return (
        <section className="max-w-3xl">
            <h1 className="text-3xl font-semibold">Mi perfil</h1>

            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <span className="w-20 h-20 rounded-full bg-smoke-900 text-smoke-100 text-2xl font-bold flex items-center justify-center shrink-0">
                    {iniciales(usuario.nombre)}
                </span>
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-smoke-700">Nombre</dt>
                        <dd className="font-semibold">{usuario.nombre}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wide text-smoke-700">Correo</dt>
                        <dd className="font-semibold break-all">{usuario.email}</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-smoke-700">Rol</dt>
                        <dd>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-smoke-900 text-smoke-100 text-sm">
                                {rol?.texto ?? usuario.rol}
                            </span>
                            <p className="text-smoke-700 text-sm mt-1">{rol?.descripcion}</p>
                        </dd>
                    </div>
                </dl>
            </div>

            {accesos.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mt-8">Tus accesos</h2>
                    <div className="grid gap-4 mt-3 sm:grid-cols-2">
                        {accesos.map((item) => (
                            <Link
                                key={item.ruta}
                                to={item.ruta}
                                className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
                            >
                                <i className={`${item.icono} text-2xl text-smoke-700`}></i>
                                <span className="font-semibold">{item.texto}</span>
                                <i className="fa-solid fa-arrow-right ml-auto text-smoke-500"></i>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            <button
                type="button"
                onClick={cerrarSesion}
                className="mt-8 py-2 px-4 rounded-lg border border-danger text-danger hover:bg-danger hover:text-smoke-100 transition-colors duration-300 cursor-pointer"
            >
                <i className="fa-solid fa-right-from-bracket mr-2"></i>Cerrar sesión
            </button>
        </section>
    )
}
