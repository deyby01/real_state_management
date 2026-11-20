import { useState } from "react"
import { Link } from "react-router-dom"
import { crearSolicitud } from "../../services/solicitud.service"

const FORMULARIO_VACIO = {
    ingresosMensuales: "",
    ocupacion: "",
    numeroOcupantes: "",
    tieneMascotas: false,
}

/**
 * "Solicitar arriendo" form shown to a client on the public property detail page.
 * The client and the executive are set by the backend from the token and the
 * property, so only the background data is sent.
 *
 * @param {Object} props
 * @param {string} props.propiedadId - The property the client wants to rent.
 */
export default function SolicitarArriendoForm({ propiedadId }) {
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO)
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [enviada, setEnviada] = useState(false)

    const cambiarCampo = (e) => {
        const { name, value, type, checked } = e.target
        setFormulario({ ...formulario, [name]: type === "checkbox" ? checked : value })
    }

    const enviar = async (e) => {
        e.preventDefault()
        setError("")
        setEnviando(true)
        try {
            await crearSolicitud({
                propiedadId,
                antecedentes: {
                    ingresosMensuales: Number(formulario.ingresosMensuales),
                    ocupacion: formulario.ocupacion.trim(),
                    numeroOcupantes: Number(formulario.numeroOcupantes),
                    tieneMascotas: formulario.tieneMascotas,
                },
            })
            setEnviada(true)
        } catch (err) {
            // e.g. 409 when the account has no client profile or the property is no longer PUBLISHED
            setError(err.message)
        } finally {
            setEnviando(false)
        }
    }

    if (enviada) {
        return (
            <div role="status" className="text-center">
                <i className="fa-solid fa-circle-check text-3xl text-emerald-700"></i>
                <p className="mt-3 font-semibold text-[#173f52]">Solicitud enviada</p>
                <p className="text-sm text-stone-500 mt-1">El ejecutivo revisará tus antecedentes y te contactará.</p>
                <Link
                    to="/panel/mis-solicitudes"
                    className="block mt-4 bg-[#173f52] hover:bg-[#285f70] text-white font-semibold px-4 py-3 rounded-md transition"
                >
                    Ver mis solicitudes
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={enviar} className="space-y-3 text-sm">
            <p className="font-semibold text-[#173f52]">Solicitar arriendo</p>
            <p className="text-stone-500">Cuéntanos tus antecedentes para evaluar la solicitud.</p>

            {error && <p role="alert" className="px-3 py-2 rounded-md bg-red-50 text-danger">{error}</p>}

            <label className="block text-stone-700">
                Ingresos mensuales (CLP)
                <input
                    type="number"
                    name="ingresosMensuales"
                    value={formulario.ingresosMensuales}
                    onChange={cambiarCampo}
                    min="0"
                    step="1000"
                    required
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md bg-white"
                />
            </label>

            <label className="block text-stone-700">
                Ocupación
                <input
                    type="text"
                    name="ocupacion"
                    value={formulario.ocupacion}
                    onChange={cambiarCampo}
                    required
                    maxLength="120"
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md bg-white"
                />
            </label>

            <label className="block text-stone-700">
                Número de ocupantes
                <input
                    type="number"
                    name="numeroOcupantes"
                    value={formulario.numeroOcupantes}
                    onChange={cambiarCampo}
                    min="1"
                    step="1"
                    required
                    className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md bg-white"
                />
            </label>

            <label className="flex items-center gap-2 text-stone-700">
                <input
                    type="checkbox"
                    name="tieneMascotas"
                    checked={formulario.tieneMascotas}
                    onChange={cambiarCampo}
                />
                Tengo mascotas
            </label>

            <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#173f52] hover:bg-[#285f70] text-white font-semibold px-4 py-3 rounded-md transition disabled:opacity-60 cursor-pointer"
            >
                {enviando ? "Enviando..." : "Enviar solicitud"}
            </button>
        </form>
    )
}
