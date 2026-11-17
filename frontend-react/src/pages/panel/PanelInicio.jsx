import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { MENU_POR_ROL } from "../../layouts/menuPanel"

/**
 * Home page of the panel (/panel): a greeting and one card per section of the
 * user's role, the same links as the sidebar.
 */
export default function PanelInicio() {
    const { usuario } = useAuth()
    const menu = MENU_POR_ROL[usuario.rol] ?? []

    return (
        <section>
            <h1 className="text-3xl font-semibold">Hola, {usuario.nombre}</h1>
            <p className="text-smoke-700 mt-1">¿Qué quieres gestionar hoy?</p>

            <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map((item) => (
                    <Link
                        key={item.ruta}
                        to={item.ruta}
                        className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
                    >
                        <i className={`${item.icono} text-2xl text-smoke-700`}></i>
                        <span className="font-semibold">{item.texto}</span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
