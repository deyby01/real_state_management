import { useEffect, useState } from "react"
import { listarVisitas } from "../../services/visita.service"
import { formatearFechaHora } from "../../utils/formato"
import { ESTADOS_VISITA, VALORES_ESTADO } from "../../components/visitas/estadosVisita"
import AccionesVisita from "../../components/visitas/AccionesVisita"

/**
 * Executive visit agenda (/panel/visitas, CU7): list with estado filter and
 * state actions (confirm, reject, cancel, record outcome).
 */
export default function VisitasPanel() {
    const [filtros, setFiltros] = useState({ estado: "" })
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState({ clave: null, visitas: [], error: "" })
    const [aviso, setAviso] = useState({ tipo: "", texto: "" })

    const clave = `${filtros.estado}|${version}`

    useEffect(() => {
        let vigente = true
        listarVisitas({ estado: filtros.estado })
            .then((visitas) => vigente && setResultado({ clave, visitas, error: "" }))
            .catch((error) => vigente && setResultado({ clave, visitas: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [clave, filtros.estado])

    const cargando = resultado.clave !== clave

    const recargarExito = (mensaje) => {
        setAviso({ tipo: "ok", texto: mensaje })
        setVersion((v) => v + 1)
    }

    const mostrarError = (mensaje) => {
        setAviso({ tipo: "error", texto: mensaje })
    }

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Visitas</h1>
                    <p className="text-smoke-700 mt-1">
                        Confirma, rechaza, cancela o registra el resultado según el estado de cada visita.
                    </p>
                </div>
                <label className="text-sm">
                    <span className="sr-only">Filtrar por estado</span>
                    <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ estado: e.target.value })}
                        className="px-3 py-2 border border-smoke-300 rounded-lg bg-white"
                    >
                        <option value="">Todos los estados</option>
                        {VALORES_ESTADO.map((valor) => (
                            <option key={valor} value={valor}>
                                {ESTADOS_VISITA[valor]?.texto ?? valor}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {aviso.texto && (
                <p
                    role={aviso.tipo === "error" ? "alert" : "status"}
                    className={`mt-4 px-4 py-3 rounded-lg text-sm flex justify-between gap-4 ${
                        aviso.tipo === "error" ? "bg-red-50 text-danger" : "bg-emerald-50 text-emerald-800"
                    }`}
                >
                    {aviso.texto}
                    <button
                        type="button"
                        onClick={() => setAviso({ tipo: "", texto: "" })}
                        aria-label="Cerrar aviso"
                        className="cursor-pointer"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                {cargando ? (
                    <p className="p-8 text-center text-smoke-700">Cargando visitas...</p>
                ) : resultado.error ? (
                    <p role="alert" className="p-8 text-center text-danger">
                        {resultado.error}
                    </p>
                ) : resultado.visitas.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">No hay visitas con estos filtros.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Propiedad</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Ejecutivo</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.visitas.map((visita) => (
                                <FilaVisita
                                    key={visita._id}
                                    visita={visita}
                                    onExito={recargarExito}
                                    onError={mostrarError}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}

function FilaVisita({ visita, onExito, onError }) {
    const estado = ESTADOS_VISITA[visita.estado]

    return (
        <tr className="border-b border-smoke-300 last:border-0">
            <td className="p-3 whitespace-nowrap">{formatearFechaHora(visita.fechaInicio)}</td>
            <td className="p-3">
                <p className="font-medium">{visita.propiedadId?.titulo ?? "—"}</p>
                {visita.observaciones && (
                    <p className="text-xs text-smoke-600 mt-0.5 line-clamp-2">{visita.observaciones}</p>
                )}
            </td>
            <td className="p-3 whitespace-nowrap">{visita.clienteId?.nombre ?? "—"}</td>
            <td className="p-3 whitespace-nowrap">{visita.ejecutivoId?.nombre ?? "—"}</td>
            <td className="p-3">
                <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${estado?.clase ?? ""}`}
                >
                    {estado?.texto ?? visita.estado}
                </span>
            </td>
            <td className="p-3 align-top">
                <AccionesVisita visita={visita} onExito={onExito} onError={onError} />
            </td>
        </tr>
    )
}