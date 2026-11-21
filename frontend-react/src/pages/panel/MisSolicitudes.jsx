import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ESTADOS_SOLICITUD } from "../../components/solicitudes/estadosSolicitud"
import { cancelarSolicitud, listarSolicitudes } from "../../services/solicitud.service"
import { formatearDireccion, formatearFechaHora, formatearPrecio } from "../../utils/formato"

/**
 * Client's rental requests (/panel/mis-solicitudes, CLIENTE, CU8): their own
 * requests in every state and the option to withdraw one while it is PENDIENTE.
 * The API decides whose requests they are (from the token); releasing a
 * reservation belongs to the executive (CU9).
 */
export default function MisSolicitudes() {
    // The answer is saved with the version it belongs to: while it does not match,
    // the page is loading (same pattern as PropiedadesPanel, no extra state to reset)
    const [resultado, setResultado] = useState({ clave: null, solicitudes: [], error: "" })
    const [version, setVersion] = useState(0)
    const [aviso, setAviso] = useState({ tipo: "", texto: "" })

    const clave = String(version)

    useEffect(() => {
        let vigente = true
        listarSolicitudes()
            .then((solicitudes) => vigente && setResultado({ clave, solicitudes, error: "" }))
            .catch((error) => vigente && setResultado({ clave, solicitudes: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [clave])

    const cargando = resultado.clave !== clave
    const { solicitudes, error } = resultado

    /** Withdraws a pending request and reloads the list from the API. */
    const cancelar = async (solicitud) => {
        if (!window.confirm(`¿Cancelar tu solicitud para "${solicitud.propiedadId?.titulo ?? "esta propiedad"}"?`)) return
        try {
            await cancelarSolicitud(solicitud._id)
            setAviso({ tipo: "ok", texto: "Solicitud cancelada" })
            setVersion((v) => v + 1)
        } catch (err) {
            // e.g. 409 when the request is no longer PENDIENTE: the backend decides
            setAviso({ tipo: "error", texto: err.message })
        }
    }

    return (
        <section>
            <h1 className="text-3xl font-semibold">Mis solicitudes</h1>
            <p className="text-smoke-700 mt-1">El estado de tus solicitudes de arriendo y su propiedad.</p>

            {aviso.texto && (
                <p
                    role={aviso.tipo === "error" ? "alert" : "status"}
                    className={`mt-4 px-4 py-3 rounded-lg text-sm flex justify-between gap-4 ${
                        aviso.tipo === "error" ? "bg-red-50 text-danger" : "bg-emerald-50 text-emerald-800"
                    }`}
                >
                    {aviso.texto}
                    <button type="button" onClick={() => setAviso({ tipo: "", texto: "" })} aria-label="Cerrar aviso" className="cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>
            )}

            {cargando ? (
                <p className="mt-8 text-smoke-700">Cargando tus solicitudes...</p>
            ) : error ? (
                <p role="alert" className="mt-6 px-4 py-3 rounded-lg bg-red-50 text-danger">{error}</p>
            ) : solicitudes.length === 0 ? (
                <p className="mt-8 text-smoke-700">
                    Aún no tienes solicitudes. Explora el{" "}
                    <Link to="/propiedades" className="font-semibold hover:underline">catálogo</Link> y solicita el arriendo de una propiedad.
                </p>
            ) : (
                <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">Propiedad</th>
                                <th className="p-3 text-right">Arriendo</th>
                                <th className="p-3">Solicitada</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.map((solicitud) => (
                                <FilaSolicitud key={solicitud._id} solicitud={solicitud} onCancelar={() => cancelar(solicitud)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}

/** One of the client's requests: property, rent, date, state and the withdraw action. */
function FilaSolicitud({ solicitud, onCancelar }) {
    const estado = ESTADOS_SOLICITUD[solicitud.estado]
    const propiedad = solicitud.propiedadId

    return (
        <tr className="border-b border-smoke-300 last:border-0">
            <td className="p-3">
                <p className="font-semibold">{propiedad?.titulo ?? "Propiedad no disponible"}</p>
                {propiedad?.direccion && <p className="text-xs text-smoke-700">{formatearDireccion(propiedad.direccion)}</p>}
            </td>
            <td className="p-3 text-right whitespace-nowrap">{propiedad ? formatearPrecio(propiedad.valorArriendo) : "—"}</td>
            <td className="p-3 whitespace-nowrap">{formatearFechaHora(solicitud.createdAt)}</td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${estado?.clase ?? ""}`}>
                    {estado?.texto ?? solicitud.estado}
                </span>
            </td>
            <td className="p-3">
                <div className="flex justify-end gap-1 whitespace-nowrap">
                    {solicitud.estado === "PENDIENTE" && (
                        <button
                            type="button"
                            onClick={onCancelar}
                            title="Cancelar solicitud"
                            aria-label="Cancelar solicitud"
                            className="p-2 rounded-lg hover:bg-canvas text-danger cursor-pointer"
                        >
                            <i className="fa-solid fa-ban"></i>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}
