import { Link } from "react-router-dom"

/**
 * Placeholder for a panel section whose page does not exist yet. App.jsx uses it
 * as the catch-all (*) route of /panel; it disappears from a section as soon as
 * its owner adds the real <Route>.
 */
export default function EnConstruccion() {
    return (
        <section className="bg-white rounded-xl shadow-sm p-8 text-center">
            <i className="fa-solid fa-person-digging text-4xl text-smoke-500"></i>
            <h1 className="text-2xl font-semibold mt-4">Sección en construcción</h1>
            <p className="text-smoke-700 mt-1">Esta parte del panel todavía se está integrando.</p>
            <Link to="/panel" className="inline-block mt-6 py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100">
                Volver al inicio del panel
            </Link>
        </section>
    )
}
