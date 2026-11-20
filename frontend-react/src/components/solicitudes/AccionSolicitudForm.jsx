import { useState } from "react"
import { ETIQUETAS_ACCION } from "./estadosSolicitud"

/**
 * Confirmation dialog for a rental request state change. The optional observation
 * is appended to the request's notes by the backend.
 *
 * @param {Object} props
 * @param {string} props.accion - evaluar, aprobar, rechazar or cancelar.
 * @param {Object} props.solicitud - The request (uses `propiedadId.titulo`).
 * @param {(observacion?: string) => Promise} props.onConfirmar
 * @param {Function} props.onCancelar
 */
export default function AccionSolicitudForm({ accion, solicitud, onConfirmar, onCancelar }) {
    const etiqueta = ETIQUETAS_ACCION[accion]?.texto ?? accion
    const [observacion, setObservacion] = useState("")
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const enviar = async (e) => {
        e.preventDefault()
        setError("")
        setEnviando(true)
        try {
            await onConfirmar(observacion.trim() || undefined)
        } catch (err) {
            setError(err.message)
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="space-y-4">
            <p className="text-sm text-smoke-700">
                Vas a <strong className="text-ink">{etiqueta.toLowerCase()}</strong> la solicitud de{" "}
                <span className="font-semibold text-ink">{solicitud.propiedadId?.titulo ?? "esta propiedad"}</span>.
            </p>

            {error && <p role="alert" className="px-4 py-3 rounded-lg bg-red-50 text-danger text-sm">{error}</p>}

            <label className="block text-sm font-medium text-smoke-700">
                Observación (opcional, queda en el historial)
                <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg"
                />
            </label>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancelar} className="py-2 px-4 rounded-lg border border-smoke-300 cursor-pointer">Cancelar</button>
                <button type="submit" disabled={enviando} className="py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100 cursor-pointer disabled:opacity-60">
                    {enviando ? "Guardando..." : etiqueta}
                </button>
            </div>
        </form>
    )
}
