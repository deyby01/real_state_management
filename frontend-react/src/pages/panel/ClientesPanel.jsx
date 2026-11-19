import { useCallback, useEffect, useState } from "react"
import Modal from "../../components/panel/Modal"
import ClienteForm from "../../components/clientes/ClienteForm"
import { actualizarCliente, crearCliente, listarClientes } from "../../services/cliente.service"

/**
 * Client states as stored by the backend (rule 9). Same idea as ESTADOS_PROPIEDAD:
 * the constant is kept and only the label and the color are added.
 */
const ESTADOS_CLIENTE = {
    INTERESADO: { texto: "Interesado", clase: "bg-sky-100 text-sky-800" },
    ARRENDATARIO: { texto: "Arrendatario", clase: "bg-emerald-100 text-emerald-800" },
}

/**
 * Clients panel for the executive (/panel/clientes, CU5): the active clients with
 * their contact data and state, plus the dialog to register a new one or edit an
 * existing one. Delete comes in the next step.
 *
 * After saving, the list is requested again (`version`): the server sets `estado`,
 * `activo` and the timestamps, so it is the source of truth. `clave` keeps each
 * answer tied to its request, so a slow one cannot overwrite a newer answer.
 */
export default function ClientesPanel() {
    const [version, setVersion] = useState(0)
    const [resultado, setResultado] = useState({ clave: null, clientes: [], error: "" })
    const [modal, setModal] = useState(null)
    const [aviso, setAviso] = useState({ tipo: "", texto: "" })

    useEffect(() => {
        let vigente = true
        listarClientes()
            .then((clientes) => vigente && setResultado({ clave: version, clientes, error: "" }))
            .catch((error) => vigente && setResultado({ clave: version, clientes: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [version])

    const cargando = resultado.clave !== version
    const cerrarModal = useCallback(() => setModal(null), [])

    /** Closes the dialog, shows a message and reloads the list from the API. */
    const terminar = (texto) => {
        setModal(null)
        setAviso({ tipo: "ok", texto })
        setVersion((v) => v + 1)
    }

    // No try/catch here: if the API fails, the form catches the error and shows
    // the backend's message (400 or 409) inside the dialog.
    const guardar = async (datos) => {
        if (modal.cliente) {
            await actualizarCliente(modal.cliente._id, datos)
            terminar("Cliente actualizado.")
            return
        }
        await crearCliente(datos)
        terminar("Cliente creado.")
    }

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Clientes</h1>
                    <p className="text-smoke-700 mt-1">Cartera de interesados y arrendatarios de la inmobiliaria.</p>
                </div>
                <button type="button" onClick={() => setModal({})} className="py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100 cursor-pointer">
                    <i className="fa-solid fa-plus mr-2"></i>Nuevo cliente
                </button>
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
                    <p className="p-8 text-center text-smoke-700">Cargando clientes...</p>
                ) : resultado.error ? (
                    <p role="alert" className="p-8 text-center text-danger">{resultado.error}</p>
                ) : resultado.clientes.length === 0 ? (
                    <p className="p-8 text-center text-smoke-700">No hay clientes registrados.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="text-left text-smoke-700 border-b border-smoke-300">
                            <tr>
                                <th className="p-3">RUT</th>
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Teléfono</th>
                                <th className="p-3">Comuna</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.clientes.map((cliente) => {
                                const estado = ESTADOS_CLIENTE[cliente.estado]
                                return (
                                    <tr key={cliente._id} className="border-b border-smoke-300 last:border-0">
                                        <td className="p-3 whitespace-nowrap font-mono text-xs">{cliente.rut}</td>
                                        <td className="p-3 font-semibold">{cliente.nombre}</td>
                                        <td className="p-3">{cliente.email}</td>
                                        <td className="p-3 whitespace-nowrap">{cliente.telefono || "—"}</td>
                                        <td className="p-3 whitespace-nowrap">{cliente.comuna}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${estado?.clase ?? ""}`}>
                                                {estado?.texto ?? cliente.estado}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setModal({ cliente })}
                                                title={`Editar a ${cliente.nombre}`}
                                                aria-label={`Editar a ${cliente.nombre}`}
                                                className="py-1 px-2 rounded-md text-smoke-700 hover:bg-smoke-100 cursor-pointer"
                                            >
                                                <i className="fa-solid fa-pencil"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <Modal titulo={modal.cliente ? "Editar cliente" : "Nuevo cliente"} onCerrar={cerrarModal}>
                    <ClienteForm cliente={modal.cliente} onGuardar={guardar} onCancelar={cerrarModal} />
                </Modal>
            )}
        </section>
    )
}
