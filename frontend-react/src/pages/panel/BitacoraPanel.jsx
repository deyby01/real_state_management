import { useEffect, useState } from "react"
import { listarBitacora } from "../../services/bitacora.service"
import { formatearFechaHora } from "../../utils/formato"

const ENTIDADES = { PROPIEDAD: "Propiedad", VISITA: "Visita", SOLICITUD: "Solicitud" }

const ACCIONES = {
    CREACION: "Creación",
    CAMBIO_ESTADO: "Cambio de estado",
    RESERVA: "Reserva",
    LIBERACION_RESERVA: "Liberación de reserva",
    ELIMINACION: "Eliminación",
    REPROGRAMACION: "Reprogramación",
}

/** "EN_MANTENCION" → "EN MANTENCION": stored constants read better without underscores. */
const legible = (estado) => estado?.replaceAll("_", " ") ?? ""

/**
 * Audit log for the ADMIN (/panel/bitacora, RN-13): every creation, state change,
 * reservation and deletion of properties, visits and requests, newest first.
 * Read only: the log is insert-only (rule 12).
 */
export default function BitacoraPanel() {
    const [entidad, setEntidad] = useState("")
    const [accion, setAccion] = useState("")
    const [resultado, setResultado] = useState({ entidad: null, entradas: [], error: "" })

    // The entity filter goes to the API; the action filter is applied here
    useEffect(() => {
        let vigente = true
        listarBitacora({ entidad })
            .then((entradas) => vigente && setResultado({ entidad, entradas, error: "" }))
            .catch((error) => vigente && setResultado({ entidad, entradas: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [entidad])

    const cargando = resultado.entidad !== entidad
    const entradas = resultado.entradas.filter((entrada) => !accion || entrada.accion === accion)

    const selectClass = "px-3 py-2 border border-smoke-300 rounded-lg bg-white text-sm"

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Bitácora</h1>
                    <p className="text-smoke-700 mt-1">Quién cambió qué y cuándo. Los registros no se pueden editar ni borrar.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select aria-label="Filtrar por entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)} className={selectClass}>
                        <option value="">Todas las entidades</option>
                        {Object.entries(ENTIDADES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                    </select>
                    <select aria-label="Filtrar por acción" value={accion} onChange={(e) => setAccion(e.target.value)} className={selectClass}>
                        <option value="">Todas las acciones</option>
                        {Object.entries(ACCIONES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                {cargando ? (
                    <p className="p-8 text-center text-smoke-700">Cargando bitácora...</p>
                ) : resultado.error ? (
                    <p role="alert" className="p-8 text-center text-danger">{resultado.error}</p>
                ) : entradas.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">
                        No hay movimientos con estos filtros. Se registran cuando un ejecutivo o un cliente cambia algo en el sistema.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Entidad</th>
                                <th className="p-3">Acción</th>
                                <th className="p-3">Cambio</th>
                                <th className="p-3">Usuario</th>
                                <th className="p-3">Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entradas.map((entrada) => (
                                <tr key={entrada._id} className="border-b border-smoke-300 last:border-0 align-top">
                                    <td className="p-3 whitespace-nowrap">{formatearFechaHora(entrada.fecha)}</td>
                                    <td className="p-3">
                                        {ENTIDADES[entrada.entidad] ?? entrada.entidad}
                                        {/* Last characters of the id: enough to tell two entries apart */}
                                        <span className="block text-xs text-smoke-500 font-mono">…{String(entrada.entidadId).slice(-6)}</span>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">{ACCIONES[entrada.accion] ?? entrada.accion}</td>
                                    <td className="p-3 whitespace-nowrap text-xs">
                                        {entrada.estadoAnterior && entrada.estadoAnterior !== entrada.estadoNuevo ? (
                                            <>{legible(entrada.estadoAnterior)} <i className="fa-solid fa-arrow-right mx-1"></i> {legible(entrada.estadoNuevo)}</>
                                        ) : (
                                            legible(entrada.estadoNuevo)
                                        )}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                        {entrada.usuarioId?.nombre ?? "—"}
                                        <span className="block text-xs text-smoke-500">{entrada.usuarioId?.rol}</span>
                                    </td>
                                    <td className="p-3 text-smoke-700 min-w-48">{entrada.observacion || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}
