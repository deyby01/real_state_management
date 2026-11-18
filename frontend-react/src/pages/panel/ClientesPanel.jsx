import { useEffect, useState } from "react"
import { listarClientes } from "../../services/cliente.service"

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
 * their contact data and state. Read only for now; create, edit and delete come in
 * the next steps. An inactive client never appears here (the API filters them out).
 */
export default function ClientesPanel() {
    const [resultado, setResultado] = useState(null)

    useEffect(() => {
        let vigente = true
        listarClientes()
            .then((clientes) => vigente && setResultado({ clientes, error: "" }))
            .catch((error) => vigente && setResultado({ clientes: [], error: error.message }))
        return () => {
            vigente = false
        }
    }, [])

    const cargando = resultado === null

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Clientes</h1>
                    <p className="text-smoke-700 mt-1">Cartera de interesados y arrendatarios de la inmobiliaria.</p>
                </div>
            </div>

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
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}
