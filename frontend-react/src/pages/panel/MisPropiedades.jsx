import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ESTADOS_PROPIEDAD } from "../../components/propiedades/estadosPropiedad"
import { listarMisPropiedades } from "../../services/misPropiedades.service"
import { formatearDireccion, formatearPrecio } from "../../utils/formato"

/**
 * Owner's view (/panel/mis-propiedades, PROPIETARIO): their properties in every
 * state and the executive in charge of each one. Read only: the executive manages
 * the properties (CU3). The API decides whose properties they are (from the token).
 */
export default function MisPropiedades() {
    const [resultado, setResultado] = useState({ cargando: true, propiedades: [], error: "" })

    useEffect(() => {
        listarMisPropiedades()
            .then((propiedades) => setResultado({ cargando: false, propiedades, error: "" }))
            .catch((error) => setResultado({ cargando: false, propiedades: [], error: error.message }))
    }, [])

    const { cargando, propiedades, error } = resultado

    // How many properties are in each state, for the summary boxes
    const porEstado = propiedades.reduce((cuenta, propiedad) => {
        cuenta[propiedad.estado] = (cuenta[propiedad.estado] ?? 0) + 1
        return cuenta
    }, {})

    return (
        <section>
            <h1 className="text-3xl font-semibold">Mis propiedades</h1>
            <p className="text-smoke-700 mt-1">El estado de cada propiedad y el ejecutivo que la administra.</p>

            {cargando ? (
                <p className="mt-8 text-smoke-700">Cargando tus propiedades...</p>
            ) : error ? (
                // e.g. 409 when the account is not linked to an owner record yet
                <p role="alert" className="mt-6 px-4 py-3 rounded-lg bg-red-50 text-danger">{error}</p>
            ) : propiedades.length === 0 ? (
                <p className="mt-8 text-smoke-700">Aún no tienes propiedades registradas.</p>
            ) : (
                <>
                    <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(ESTADOS_PROPIEDAD).map(([valor, { texto, clase }]) => (
                            <li key={valor} className="bg-white rounded-xl shadow-sm p-4">
                                <p className="text-2xl font-semibold">{porEstado[valor] ?? 0}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-semibold ${clase}`}>{texto}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {propiedades.map((propiedad) => (
                            <TarjetaMiPropiedad key={propiedad._id} propiedad={propiedad} />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

/** One of the owner's properties: cover, state, rent and the executive's contact. */
function TarjetaMiPropiedad({ propiedad }) {
    const portada = [...propiedad.imagenes].sort((a, b) => a.orden - b.orden)[0]
    const estado = ESTADOS_PROPIEDAD[propiedad.estado]

    return (
        <article className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
            {portada ? (
                <img src={portada.url} alt={propiedad.titulo} loading="lazy" className="h-40 w-full object-cover" />
            ) : (
                <div className="h-40 bg-smoke-300" />
            )}
            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{propiedad.titulo}</h2>
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold ${estado?.clase ?? ""}`}>
                        {estado?.texto ?? propiedad.estado}
                    </span>
                </div>
                <p className="text-sm text-smoke-700 mt-1">{formatearDireccion(propiedad.direccion)}</p>
                <p className="mt-2 font-semibold">{formatearPrecio(propiedad.valorArriendo)} <small className="font-normal text-smoke-700">/ mes</small></p>

                <div className="mt-auto pt-3 border-t border-smoke-300 text-sm">
                    <p className="text-smoke-700">Ejecutivo a cargo</p>
                    <p className="font-semibold">{propiedad.ejecutivoId?.nombre ?? "Sin asignar"}</p>
                    {propiedad.ejecutivoId?.email && (
                        <a href={`mailto:${propiedad.ejecutivoId.email}`} className="text-smoke-700 hover:underline">
                            {propiedad.ejecutivoId.email}
                        </a>
                    )}
                </div>
                {propiedad.estado === "PUBLICADA" && (
                    <Link to={`/propiedades/${propiedad._id}`} className="mt-3 text-sm font-semibold hover:underline">
                        Ver como aparece en el catálogo <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Link>
                )}
            </div>
        </article>
    )
}
