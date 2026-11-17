import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import GaleriaPropiedad from "../components/propiedades/GaleriaPropiedad"
import { useAuth } from "../context/AuthContext"
import { obtenerPropiedadCatalogo } from "../services/catalogo.service"
import { formatearDireccion, formatearPrecio } from "../utils/formato"

/**
 * Public detail of a published property (/propiedades/:id), from GET /api/catalogo/:id.
 * Anyone can see it; the owner's data never reaches the page (RNF-08).
 * A property that is no longer published (reserved, rented, deleted) answers 404
 * and shows a "not available" message instead of an error.
 *
 * The action box is the meeting point of other teammates' tasks (memory/integracion.md):
 * for a logged-in CLIENTE it will hold the rental request form (Roberto) and the
 * visit scheduling (Ignacio).
 */
export default function DetallePropiedadPage() {
    const { id } = useParams()
    const ubicacion = useLocation()
    const { usuario } = useAuth()
    // The answer is saved together with the id it belongs to: while it does not
    // match the id in the URL, the page is loading (no extra state to reset)
    const [resultado, setResultado] = useState({ id: null, propiedad: null, error: null })

    useEffect(() => {
        // If the user opens another property before this request answers, the old
        // answer must not overwrite the new page: the cleanup marks it as stale
        let vigente = true
        obtenerPropiedadCatalogo(id)
            .then((propiedad) => vigente && setResultado({ id, propiedad, error: null }))
            .catch((error) => vigente && setResultado({ id, propiedad: null, error }))
        return () => {
            vigente = false
        }
    }, [id])

    const cargando = resultado.id !== id
    const { propiedad, error } = cargando ? { propiedad: null, error: null } : resultado

    return (
        <div className="min-h-screen bg-[#f7f4ef] flex flex-col">
            <Header />
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8">
                <Link to="/propiedades" className="text-sm text-[#173f52] hover:underline">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Volver al catálogo
                </Link>

                {cargando ? (
                    <p className="mt-10 text-center text-stone-500">Cargando propiedad...</p>
                ) : error ? (
                    <NoDisponible error={error} />
                ) : (
                    <article className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
                        <div>
                            {/* key: a different property starts its gallery at the first image */}
                            <GaleriaPropiedad key={propiedad._id} imagenes={propiedad.imagenes} titulo={propiedad.titulo} />

                            <p className="mt-6 text-emerald-700 text-sm font-bold">
                                {propiedad.tipoId?.nombre} · {propiedad.direccion.comuna}
                            </p>
                            <h1 className="text-3xl font-semibold text-[#173f52] mt-1">{propiedad.titulo}</h1>
                            <p className="text-stone-500 mt-1">
                                <i className="fa-solid fa-location-dot mr-2"></i>
                                {formatearDireccion(propiedad.direccion)}
                            </p>

                            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                <Dato icono="fa-solid fa-ruler-combined" valor={`${propiedad.superficie} m²`} texto="Superficie" />
                                <Dato icono="fa-solid fa-bed" valor={propiedad.dormitorios} texto="Dormitorios" />
                                <Dato icono="fa-solid fa-bath" valor={propiedad.banos} texto="Baños" />
                                <Dato icono="fa-solid fa-car" valor={propiedad.estacionamientos} texto="Estacionamientos" />
                            </ul>

                            {propiedad.caracteristicas.length > 0 && (
                                <section className="mt-8">
                                    <h2 className="text-xl font-semibold text-[#173f52]">Características</h2>
                                    <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                                        {propiedad.caracteristicas.map((caracteristica) => (
                                            <li key={caracteristica} className="text-stone-700">
                                                <i className="fa-solid fa-check text-emerald-700 mr-2"></i>
                                                {caracteristica}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        <aside className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 h-fit lg:sticky lg:top-28">
                            <p className="text-sm text-stone-500">Arriendo mensual</p>
                            <p className="text-3xl font-bold text-[#ad654a]">{formatearPrecio(propiedad.valorArriendo)}</p>
                            {propiedad.gastosComunes > 0 && (
                                <p className="text-sm text-stone-500 mt-1">
                                    + {formatearPrecio(propiedad.gastosComunes)} de gastos comunes
                                </p>
                            )}
                            <hr className="my-5 border-stone-200" />
                            <AccionesCliente usuario={usuario} ubicacion={ubicacion} />
                        </aside>
                    </article>
                )}
            </main>
            <Footer />
        </div>
    )
}

/** One spec box (superficie, dormitorios...). */
function Dato({ icono, valor, texto }) {
    return (
        <li className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <i className={`${icono} text-stone-400`}></i>
            <p className="text-lg font-semibold text-[#173f52]">{valor}</p>
            <p className="text-xs text-stone-500">{texto}</p>
        </li>
    )
}

/**
 * What the visitor can do with the property, by session:
 * - no session: log in (and come back here thanks to `state.desde`);
 * - CLIENTE: the rental request form and visit scheduling go here (Roberto, Ignacio);
 * - other roles: they manage properties from the panel, not from the catalog.
 */
function AccionesCliente({ usuario, ubicacion }) {
    if (!usuario) {
        return (
            <div className="text-center">
                <p className="text-stone-600 text-sm">
                    Inicia sesión como cliente para solicitar el arriendo o agendar una visita.
                </p>
                <Link
                    to="/login"
                    state={{ desde: ubicacion }}
                    className="block mt-4 bg-[#173f52] hover:bg-[#285f70] text-white font-semibold px-4 py-3 rounded-md transition"
                >
                    Iniciar sesión
                </Link>
                <Link to="/registro" className="block mt-3 text-sm text-[#173f52] hover:underline">
                    ¿No tienes cuenta? Regístrate
                </Link>
            </div>
        )
    }

    if (usuario.rol !== "CLIENTE") {
        return (
            <p className="text-stone-600 text-sm text-center">
                Estás viendo el catálogo público. Gestiona las propiedades desde{" "}
                <Link to="/panel" className="text-[#173f52] font-semibold hover:underline">tu panel</Link>.
            </p>
        )
    }

    // Roberto renders <SolicitarArriendoForm propiedadId={...} /> here, and Ignacio
    // the visit scheduling, when their tasks are merged (memory/integracion.md)
    return (
        <p className="text-stone-600 text-sm text-center">
            Muy pronto podrás solicitar el arriendo y agendar una visita desde aquí.
        </p>
    )
}

/**
 * Message for a property that cannot be shown. A 404 or 400 means it is not
 * published (or the link is wrong): that is normal, not an error of the page.
 */
function NoDisponible({ error }) {
    const noExiste = error.status === 404 || error.status === 400
    return (
        <section className="mt-10 bg-white border border-stone-200 rounded-xl p-8 text-center">
            <i className="fa-regular fa-face-frown text-4xl text-stone-400"></i>
            <h1 className="text-2xl font-semibold text-[#173f52] mt-4">
                {noExiste ? "Esta propiedad ya no está disponible" : "No pudimos cargar la propiedad"}
            </h1>
            <p role="alert" className="text-stone-500 mt-1">
                {noExiste ? "Puede que ya haya sido arrendada o reservada." : error.message}
            </p>
            <Link
                to="/propiedades"
                className="inline-block mt-6 bg-[#173f52] hover:bg-[#285f70] text-white font-semibold px-4 py-2 rounded-md transition"
            >
                Ver otras propiedades
            </Link>
        </section>
    )
}
