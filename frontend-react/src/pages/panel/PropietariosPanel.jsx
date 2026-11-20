import { useEffect, useState } from "react"
import { listarPropietarios } from "../../services/propietario.service"

/**
 * Displays active owners in the executive panel (CU2).
 */
export default function PropietariosPanel() {
    const [resultado, setResultado] = useState({
        propietarios: [],
        cargando: true,
        error: ""
    })

    useEffect(() => {
        let vigente = true

        listarPropietarios()
            .then((propietarios) => {
                if (vigente) setResultado({ propietarios, cargando: false, error: "" })
            })
            .catch((error) => {
                if (vigente) setResultado({ propietarios: [], cargando: false, error: error.message })
            })

        // Ignore a late response after leaving the page.
        return () => {
            vigente = false
        }
    }, [])

    return (
        <section>
            <h1 className="text-3xl font-semibold">Propietarios</h1>

            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
                {resultado.cargando ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {resultado.propietarios.map((propietario) => (
                                <tr key={propietario._id} className="border-b border-smoke-300 last:border-0">
                                    <td className="p-3 whitespace-nowrap">{propietario.rut}</td>
                                    <td className="p-3">{propietario.nombre}</td>
                                    <td className="p-3">{propietario.email}</td>
                                    <td className="p-3 whitespace-nowrap">{propietario.telefono || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}
