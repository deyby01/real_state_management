import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Modal from "../../components/panel/Modal"
import PropiedadForm from "../../components/propiedades/PropiedadForm"
import CambioEstadoForm from "../../components/propiedades/CambioEstadoForm"
import { ESTADOS_PROPIEDAD } from "../../components/propiedades/estadosPropiedad"
import {
    actualizarPropiedad,
    cambiarEstadoPropiedad,
    crearPropiedad,
    eliminarPropiedad,
    listarPropiedades,
} from "../../services/propiedad.service"
import { listarPropietarios } from "../../services/propietario.service"
import { listarTiposPropiedad } from "../../services/tipoPropiedad.service"
import { formatearPrecio } from "../../utils/formato"

/**
 * Executive's property management (/panel/propiedades, CU3): list with filters,
 * create, edit, state changes by the transition table and soft delete. Every change is
 * logged in the audit log by the backend.
 *
 * After any change the list is requested again (`version`): the server sets
 * `estado`, timestamps and populated data, so it is the source of truth.
 */
export default function PropiedadesPanel() {
    const { usuario } = useAuth()
    const [filtros, setFiltros] = useState({ estado: "", soloMias: false })
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState({ clave: null, propiedades: [], error: "" })
    const [tipos, setTipos] = useState([])
    const [modal, setModal] = useState(null)
    const [aviso, setAviso] = useState({ tipo: "", texto: "" })

    // Same idea as the catalog: an answer belongs to one search (filters + version)
    const clave = `${filtros.estado}|${filtros.soloMias}|${version}`

    useEffect(() => {
        listarTiposPropiedad().then(setTipos).catch(() => setTipos([]))
    }, [])

    useEffect(() => {
        let vigente = true
        listarPropiedades({ estado: filtros.estado, ejecutivoId: filtros.soloMias ? usuario._id : "" })
            .then((propiedades) => vigente && setResultado({ clave, propiedades, error: "" }))
            .catch((error) => vigente && setResultado({ clave, propiedades: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [clave, filtros.estado, filtros.soloMias, usuario._id])

    const cargando = resultado.clave !== clave
    const cerrarModal = useCallback(() => setModal(null), [])

    /** Closes the dialog, shows the API's message and reloads the list. */
    const terminar = (mensaje) => {
        setModal(null)
        setAviso({ tipo: "ok", texto: mensaje })
        setVersion((v) => v + 1)
    }

    /**
     * Opens the create dialog. The owners are requested at this moment, not on
     * page load, so an owner registered a minute ago in Propietarios already appears.
     */
    const abrirCreacion = async () => {
        setModal({ tipo: "crear", propietarios: null })
        try {
            const propietarios = await listarPropietarios()
            setModal({ tipo: "crear", propietarios })
        } catch (error) {
            setModal(null)
            setAviso({ tipo: "error", texto: error.message })
        }
    }

    const guardarCreacion = async (datos) => {
        const { mensaje } = await crearPropiedad(datos)
        terminar(mensaje)
    }

    const guardarEdicion = async (datos) => {
        const { mensaje } = await actualizarPropiedad(modal.propiedad._id, datos)
        terminar(mensaje)
    }

    const guardarEstado = async (estado, observacion) => {
        const { mensaje } = await cambiarEstadoPropiedad(modal.propiedad._id, estado, observacion)
        terminar(mensaje)
    }

    const eliminar = async (propiedad) => {
        if (!window.confirm(`¿Eliminar "${propiedad.titulo}"? Dejará de aparecer en el sistema.`)) return
        try {
            const { mensaje } = await eliminarPropiedad(propiedad._id)
            terminar(mensaje)
        } catch (error) {
            // e.g. 409 for RESERVADA / ARRENDADA: the rule lives in the backend
            setAviso({ tipo: "error", texto: error.message })
        }
    }

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Propiedades</h1>
                    <p className="text-smoke-700 mt-1">Administra la cartera, sus estados y su publicación.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        type="button"
                        onClick={abrirCreacion}
                        className="py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100 hover:bg-smoke-700 cursor-pointer"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>Nueva propiedad
                    </button>
                    <label className="text-sm">
                        <span className="sr-only">Filtrar por estado</span>
                        <select
                            value={filtros.estado}
                            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                            className="px-3 py-2 border border-smoke-300 rounded-lg bg-white"
                        >
                            <option value="">Todos los estados</option>
                            {Object.entries(ESTADOS_PROPIEDAD).map(([valor, { texto }]) => (
                                <option key={valor} value={valor}>{texto}</option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={filtros.soloMias}
                            onChange={(e) => setFiltros({ ...filtros, soloMias: e.target.checked })}
                        />
                        Solo mis propiedades
                    </label>
                </div>
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
                    <p className="p-8 text-center text-smoke-700">Cargando propiedades...</p>
                ) : resultado.error ? (
                    <p role="alert" className="p-8 text-center text-danger">{resultado.error}</p>
                ) : resultado.propiedades.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">No hay propiedades con estos filtros.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">Propiedad</th>
                                <th className="p-3">Propietario</th>
                                <th className="p-3">Ejecutivo</th>
                                <th className="p-3 text-right">Arriendo</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.propiedades.map((propiedad) => (
                                <FilaPropiedad
                                    key={propiedad._id}
                                    propiedad={propiedad}
                                    onEditar={() => setModal({ tipo: "editar", propiedad })}
                                    onEstado={() => setModal({ tipo: "estado", propiedad })}
                                    onEliminar={() => eliminar(propiedad)}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal?.tipo === "crear" && (
                <Modal titulo="Nueva propiedad" onCerrar={cerrarModal}>
                    {modal.propietarios === null ? (
                        <p className="text-sm text-smoke-700">Cargando propietarios...</p>
                    ) : (
                        <PropiedadForm tipos={tipos} propietarios={modal.propietarios} onGuardar={guardarCreacion} onCancelar={cerrarModal} />
                    )}
                </Modal>
            )}
            {modal?.tipo === "editar" && (
                <Modal titulo="Editar propiedad" onCerrar={cerrarModal}>
                    <PropiedadForm propiedad={modal.propiedad} tipos={tipos} onGuardar={guardarEdicion} onCancelar={cerrarModal} />
                </Modal>
            )}
            {modal?.tipo === "estado" && (
                <Modal titulo="Cambiar estado" onCerrar={cerrarModal}>
                    <CambioEstadoForm propiedad={modal.propiedad} onGuardar={guardarEstado} onCancelar={cerrarModal} />
                </Modal>
            )}
        </section>
    )
}

/** One row of the table: cover, title and address, people, price, state and actions. */
function FilaPropiedad({ propiedad, onEditar, onEstado, onEliminar }) {
    const portada = [...propiedad.imagenes].sort((a, b) => a.orden - b.orden)[0]
    const estado = ESTADOS_PROPIEDAD[propiedad.estado]
    const boton = "p-2 rounded-lg hover:bg-canvas cursor-pointer"

    return (
        <tr className="border-b border-smoke-300 last:border-0">
            <td className="p-3">
                <div className="flex items-center gap-3 min-w-56">
                    {portada ? (
                        <img src={portada.url} alt="" className="w-14 h-10 object-cover rounded" />
                    ) : (
                        <div className="w-14 h-10 rounded bg-smoke-300" />
                    )}
                    <div>
                        <p className="font-semibold">{propiedad.titulo}</p>
                        <p className="text-xs text-smoke-700">{propiedad.tipoId?.nombre} · {propiedad.direccion.comuna}</p>
                    </div>
                </div>
            </td>
            <td className="p-3 whitespace-nowrap">{propiedad.propietarioId?.nombre ?? "—"}</td>
            <td className="p-3 whitespace-nowrap">{propiedad.ejecutivoId?.nombre ?? "—"}</td>
            <td className="p-3 text-right whitespace-nowrap">{formatearPrecio(propiedad.valorArriendo)}</td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${estado?.clase ?? ""}`}>
                    {estado?.texto ?? propiedad.estado}
                </span>
            </td>
            <td className="p-3">
                <div className="flex justify-end gap-1 whitespace-nowrap">
                    {propiedad.estado === "PUBLICADA" && (
                        <Link to={`/propiedades/${propiedad._id}`} title="Ver en el catálogo" aria-label="Ver en el catálogo" className={boton}>
                            <i className="fa-solid fa-eye"></i>
                        </Link>
                    )}
                    <button type="button" onClick={onEditar} title="Editar" aria-label="Editar" className={boton}>
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" onClick={onEstado} title="Cambiar estado" aria-label="Cambiar estado" className={boton}>
                        <i className="fa-solid fa-arrow-right-arrow-left"></i>
                    </button>
                    <button type="button" onClick={onEliminar} title="Eliminar" aria-label="Eliminar" className={`${boton} text-danger`}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    )
}
