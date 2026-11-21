import { useCallback, useEffect, useState } from "react"
import Modal from "../../components/panel/Modal"
import AccionSolicitudForm from "../../components/solicitudes/AccionSolicitudForm"
import { ACCIONES_SOLICITUD, ESTADOS_SOLICITUD, ETIQUETAS_ACCION } from "../../components/solicitudes/estadosSolicitud"
import {
    aprobarSolicitud,
    cancelarSolicitud,
    evaluarSolicitud,
    listarSolicitudes,
    rechazarSolicitud,
} from "../../services/solicitud.service"
import { formatearDireccion, formatearFechaHora, formatearPrecio } from "../../utils/formato"

/** Function that applies each state change (the button label comes from ETIQUETAS_ACCION). */
const SERVICIOS = {
    evaluar: evaluarSolicitud,
    aprobar: aprobarSolicitud,
    rechazar: rechazarSolicitud,
    cancelar: cancelarSolicitud,
}

/** Message shown after each successful change; approving also reserves the property. */
const MENSAJES = {
    evaluar: "Solicitud en evaluación",
    aprobar: "Solicitud aprobada y propiedad reservada",
    rechazar: "Solicitud rechazada",
    cancelar: "Solicitud cancelada",
}

/**
 * Executive's rental requests (/panel/solicitudes, CU9): the requests assigned to
 * the logged-in executive, their background data and the state changes the state
 * allows. Approving reserves the property; cancelling an approved request releases
 * it. After every change the list is requested again: the server is the source of truth.
 */
export default function SolicitudesPanel() {
    const [filtroEstado, setFiltroEstado] = useState("")
    // The answer is saved with the version it belongs to: while it does not match,
    // the page is loading (same pattern as PropiedadesPanel, no extra state to reset)
    const [resultado, setResultado] = useState({ clave: null, solicitudes: [], error: "" })
    const [version, setVersion] = useState(0)
    const [modal, setModal] = useState(null)
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
    const visibles = filtroEstado ? solicitudes.filter((s) => s.estado === filtroEstado) : solicitudes

    const cerrarModal = useCallback(() => setModal(null), [])

    /** Runs the state change, closes the dialog and reloads the list from the API. */
    const ejecutarAccion = async (accion, solicitud, observacion) => {
        await SERVICIOS[accion](solicitud._id, observacion)
        setModal(null)
        setAviso({ tipo: "ok", texto: MENSAJES[accion] })
        setVersion((v) => v + 1)
    }

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Solicitudes</h1>
                    <p className="text-smoke-700 mt-1">Evalúa las solicitudes de arriendo asignadas a ti y reserva la propiedad.</p>
                </div>
                <label className="text-sm">
                    <span className="sr-only">Filtrar por estado</span>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="px-3 py-2 border border-smoke-300 rounded-lg bg-white"
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(ESTADOS_SOLICITUD).map(([valor, { texto }]) => (
                            <option key={valor} value={valor}>{texto}</option>
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
                    <button type="button" onClick={() => setAviso({ tipo: "", texto: "" })} aria-label="Cerrar aviso" className="cursor-pointer">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                {cargando ? (
                    <p className="p-8 text-center text-smoke-700">Cargando solicitudes...</p>
                ) : error ? (
                    <p role="alert" className="p-8 text-center text-danger">{error}</p>
                ) : visibles.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">No hay solicitudes con estos filtros.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">Propiedad</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Solicitada</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.map((solicitud) => (
                                <FilaSolicitud
                                    key={solicitud._id}
                                    solicitud={solicitud}
                                    onDetalle={() => setModal({ tipo: "detalle", solicitud })}
                                    onAccion={(accion) => setModal({ tipo: "accion", solicitud, accion })}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal?.tipo === "detalle" && (
                <Modal titulo="Detalle de la solicitud" onCerrar={cerrarModal}>
                    <DetalleSolicitud
                        solicitud={modal.solicitud}
                        onAccion={(accion) => setModal({ tipo: "accion", solicitud: modal.solicitud, accion })}
                    />
                </Modal>
            )}
            {modal?.tipo === "accion" && (
                <Modal titulo={ETIQUETAS_ACCION[modal.accion]?.texto ?? "Cambiar estado"} onCerrar={cerrarModal}>
                    <AccionSolicitudForm
                        accion={modal.accion}
                        solicitud={modal.solicitud}
                        onConfirmar={(observacion) => ejecutarAccion(modal.accion, modal.solicitud, observacion)}
                        onCancelar={cerrarModal}
                    />
                </Modal>
            )}
        </section>
    )
}

/** One row of the table: property, client, date, state and the actions the state allows. */
function FilaSolicitud({ solicitud, onDetalle, onAccion }) {
    const estado = ESTADOS_SOLICITUD[solicitud.estado]
    const acciones = ACCIONES_SOLICITUD[solicitud.estado] ?? []
    const boton = "p-2 rounded-lg hover:bg-canvas cursor-pointer"

    return (
        <tr className="border-b border-smoke-300 last:border-0">
            <td className="p-3">
                <p className="font-semibold">{solicitud.propiedadId?.titulo ?? "Propiedad no disponible"}</p>
                {solicitud.propiedadId?.direccion && (
                    <p className="text-xs text-smoke-700">{formatearDireccion(solicitud.propiedadId.direccion)}</p>
                )}
            </td>
            <td className="p-3 whitespace-nowrap">
                <p className="font-semibold">{solicitud.clienteId?.nombre ?? "—"}</p>
                {solicitud.clienteId?.email && <p className="text-xs text-smoke-700">{solicitud.clienteId.email}</p>}
            </td>
            <td className="p-3 whitespace-nowrap">{formatearFechaHora(solicitud.createdAt)}</td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${estado?.clase ?? ""}`}>
                    {estado?.texto ?? solicitud.estado}
                </span>
            </td>
            <td className="p-3">
                <div className="flex justify-end gap-1 whitespace-nowrap">
                    <button type="button" onClick={onDetalle} title="Ver detalle" aria-label="Ver detalle" className={boton}>
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    {acciones.map((accion) => (
                        <button
                            key={accion}
                            type="button"
                            onClick={() => onAccion(accion)}
                            title={ETIQUETAS_ACCION[accion].texto}
                            aria-label={ETIQUETAS_ACCION[accion].texto}
                            className={`${boton} ${accion === "rechazar" || accion === "cancelar" ? "text-danger" : ""}`}
                        >
                            <i className={ETIQUETAS_ACCION[accion].icono}></i>
                        </button>
                    ))}
                </div>
            </td>
        </tr>
    )
}

/** Background data, notes history and the state changes available from this state. */
function DetalleSolicitud({ solicitud, onAccion }) {
    const estado = ESTADOS_SOLICITUD[solicitud.estado]
    const acciones = ACCIONES_SOLICITUD[solicitud.estado] ?? []
    const { antecedentes } = solicitud

    return (
        <div className="space-y-5 text-sm">
            <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-base">{solicitud.propiedadId?.titulo ?? "Propiedad no disponible"}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${estado?.clase ?? ""}`}>
                        {estado?.texto ?? solicitud.estado}
                    </span>
                </div>
                {solicitud.propiedadId?.direccion && (
                    <p className="text-smoke-700 mt-1">{formatearDireccion(solicitud.propiedadId.direccion)}</p>
                )}
                {solicitud.propiedadId && (
                    <p className="text-smoke-700">{formatearPrecio(solicitud.propiedadId.valorArriendo)} / mes</p>
                )}
            </div>

            <div className="border-t border-smoke-300 pt-4">
                <p className="text-smoke-700">Cliente</p>
                <p className="font-semibold">{solicitud.clienteId?.nombre ?? "—"}</p>
                {solicitud.clienteId?.email && <p className="text-smoke-700">{solicitud.clienteId.email}</p>}
            </div>

            <div className="border-t border-smoke-300 pt-4">
                <p className="text-smoke-700 mb-2">Antecedentes</p>
                <dl className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-smoke-700">Ingresos mensuales</dt>
                        <dd className="font-semibold">{formatearPrecio(antecedentes?.ingresosMensuales)}</dd>
                    </div>
                    <div>
                        <dt className="text-smoke-700">Ocupación</dt>
                        <dd className="font-semibold">{antecedentes?.ocupacion ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-smoke-700">N.º de ocupantes</dt>
                        <dd className="font-semibold">{antecedentes?.numeroOcupantes ?? "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-smoke-700">Mascotas</dt>
                        <dd className="font-semibold">{antecedentes?.tieneMascotas ? "Sí" : "No"}</dd>
                    </div>
                </dl>
            </div>

            <div className="border-t border-smoke-300 pt-4">
                <p className="text-smoke-700 mb-2">Observaciones</p>
                {solicitud.observaciones?.length ? (
                    <ul className="space-y-2">
                        {solicitud.observaciones.map((observacion, indice) => (
                            <li key={indice} className="bg-canvas rounded-lg px-3 py-2">
                                <p>{observacion.texto}</p>
                                {observacion.fecha && <p className="text-xs text-smoke-700 mt-1">{formatearFechaHora(observacion.fecha)}</p>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-smoke-700">Sin observaciones.</p>
                )}
            </div>

            {acciones.length > 0 && (
                <div className="border-t border-smoke-300 pt-4 flex flex-wrap justify-end gap-2">
                    {acciones.map((accion) => (
                        <button
                            key={accion}
                            type="button"
                            onClick={() => onAccion(accion)}
                            className={`py-2 px-4 rounded-lg text-sm font-semibold cursor-pointer ${
                                accion === "aprobar"
                                    ? "bg-emerald-600 text-white"
                                    : accion === "rechazar" || accion === "cancelar"
                                        ? "bg-red-50 text-danger"
                                        : "bg-smoke-900 text-smoke-100"
                            }`}
                        >
                            <i className={`${ETIQUETAS_ACCION[accion].icono} mr-2`}></i>
                            {ETIQUETAS_ACCION[accion].texto}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
