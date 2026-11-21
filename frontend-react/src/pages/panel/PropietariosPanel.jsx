import { useCallback, useEffect, useState } from "react"
import { actualizarPropietario, crearPropietario, eliminarPropietario, listarPropietarios } from "../../services/propietario.service"
import Modal from "../../components/panel/Modal"
import PropietarioForm from "../../components/propietarios/PropietarioForm"

/**
 * Lists, creates, edits and soft-deletes owners in the executive panel (CU2).
 * Reloads the list after saving so normalized values come from the API.
 */
export default function PropietariosPanel() {
    const [version, setVersion] = useState(0)
    const [modal, setModal] = useState(null)
    const [guardando, setGuardando] = useState(false)
    const [aviso, setAviso] = useState(null)
    const [eliminandoId, setEliminandoId] = useState(null)
    const [resultado, setResultado] = useState({
        version: null,
        propietarios: [],
        error: ""
    })

    useEffect(() => {
        let vigente = true

        listarPropietarios()
            .then((propietarios) => {
                if (vigente) setResultado({ version, propietarios, error: "" })
            })
            .catch((error) => {
                if (vigente) setResultado({ version, propietarios: [], error: error.message })
            })

        // Ignore a late response after leaving the page.
        return () => {
            vigente = false
        }
    }, [version])

    const cargando = resultado.version !== version
    const cerrarModal = useCallback(() => {
        // Keep the form open until its request finishes, including backdrop/Escape closes.
        if (!guardando) setModal(null)
    }, [guardando])

    const guardar = async (datos) => {
        setGuardando(true)
        try {
            if (modal.tipo === "editar") {
                await actualizarPropietario(modal.propietario._id, datos)
            } else {
                await crearPropietario(datos)
            }
            setAviso({ tipo: "ok", texto: modal.tipo === "editar" ? "Propietario actualizado correctamente." : "Propietario creado correctamente." })
            setModal(null)
            setVersion((anterior) => anterior + 1)
        } finally {
            // Errors propagate to the form, which displays the backend's message.
            setGuardando(false)
        }
    }

    /** Confirms a soft delete and reloads the server's active-owner list. */
    const eliminar = async (propietario) => {
        if (eliminandoId) return
        if (!window.confirm(`¿Dar de baja a "${propietario.nombre}"? Dejará de aparecer en la lista de propietarios activos.`)) return
        setAviso(null)
        setEliminandoId(propietario._id)
        try {
            const { mensaje } = await eliminarPropietario(propietario._id)
            setAviso({ tipo: "ok", texto: mensaje })
            setVersion((anterior) => anterior + 1)
        } catch (error) {
            setAviso({ tipo: "error", texto: error.message })
        } finally {
            setEliminandoId(null)
        }
    }

    return (
        <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-semibold">Propietarios</h1>
                <button type="button" disabled={Boolean(eliminandoId)} onClick={() => { setAviso(null); setModal({ tipo: "crear" }) }} className="px-4 py-2 rounded-lg bg-ink text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    Nuevo propietario
                </button>
            </div>

            {aviso && (
                <p role={aviso.tipo === "error" ? "alert" : "status"} className={`mt-4 px-4 py-3 rounded-lg text-sm ${aviso.tipo === "error" ? "bg-red-50 text-danger" : "bg-emerald-50 text-emerald-800"}`}>
                    {aviso.texto}
                </p>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                {cargando ? (
                    <p role="status" className="p-8 text-center text-smoke-700">
                        Cargando propietarios...
                    </p>
                ) : resultado.error ? (
                    <p role="alert" className="p-8 text-center text-danger">{resultado.error}</p>
                ) : resultado.propietarios.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">No hay propietarios registrados.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th scope="col" className="p-3">RUT</th>
                                <th scope="col" className="p-3">Nombre</th>
                                <th scope="col" className="p-3">Email</th>
                                <th scope="col" className="p-3">Teléfono</th>
                                <th scope="col" className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.propietarios.map((propietario) => (
                                <tr key={propietario._id} className="border-b border-smoke-300 last:border-0">
                                    <td className="p-3 whitespace-nowrap">{propietario.rut}</td>
                                    <td className="p-3">{propietario.nombre}</td>
                                    <td className="p-3">{propietario.email}</td>
                                    <td className="p-3 whitespace-nowrap">{propietario.telefono || "—"}</td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <button type="button" disabled={Boolean(eliminandoId)} onClick={() => { setAviso(null); setModal({ tipo: "editar", propietario }) }} aria-label={`Editar a ${propietario.nombre}`} className="px-3 py-2 rounded-lg hover:bg-canvas cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                            Editar
                                        </button>
                                        <button type="button" disabled={Boolean(eliminandoId)} onClick={() => eliminar(propietario)} aria-label={`Eliminar a ${propietario.nombre}`} className="px-3 py-2 rounded-lg hover:bg-canvas text-danger cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                            {eliminandoId === propietario._id ? "Eliminando..." : "Eliminar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <Modal titulo={modal.tipo === "editar" ? "Editar propietario" : "Nuevo propietario"} onCerrar={cerrarModal}>
                    <PropietarioForm propietario={modal.propietario} onGuardar={guardar} onCancelar={cerrarModal} />
                </Modal>
            )}
        </section>
    )
}
