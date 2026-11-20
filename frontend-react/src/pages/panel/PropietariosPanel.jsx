import { useCallback, useEffect, useState } from "react"
import { actualizarPropietario, crearPropietario, listarPropietarios } from "../../services/propietario.service"
import Modal from "../../components/panel/Modal"
import PropietarioForm from "../../components/propietarios/PropietarioForm"

/**
 * Lists, creates and edits active owners in the executive panel (CU2).
 * Reloads the list after saving so normalized values come from the API.
 */
export default function PropietariosPanel() {
    const [version, setVersion] = useState(0)
    const [modal, setModal] = useState(null)
    const [guardando, setGuardando] = useState(false)
    const [aviso, setAviso] = useState("")
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
            setAviso(modal.tipo === "editar" ? "Propietario actualizado correctamente." : "Propietario creado correctamente.")
            setModal(null)
            setVersion((anterior) => anterior + 1)
        } finally {
            // Errors propagate to the form, which displays the backend's message.
            setGuardando(false)
        }
    }

    return (
        <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-semibold">Propietarios</h1>
                <button type="button" onClick={() => { setAviso(""); setModal({ tipo: "crear" }) }} className="px-4 py-2 rounded-lg bg-ink text-white cursor-pointer">
                    Nuevo propietario
                </button>
            </div>

            {aviso && <p role="status" className="mt-4 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm">{aviso}</p>}

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
                                    <td className="p-3 text-right">
                                        <button type="button" onClick={() => { setAviso(""); setModal({ tipo: "editar", propietario }) }} aria-label={`Editar a ${propietario.nombre}`} className="px-3 py-2 rounded-lg hover:bg-canvas cursor-pointer">
                                            Editar
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
