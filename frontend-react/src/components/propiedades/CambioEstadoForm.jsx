import { useState } from "react"
import { ESTADOS_PROPIEDAD, TRANSICIONES } from "./estadosPropiedad"

/**
 * Form to move a property to another state. It only offers the states that the
 * transition table allows from the current one; the backend checks it again.
 *
 * @param {Object} props
 * @param {Object} props.propiedad - The property (uses `estado` and `titulo`).
 * @param {(estado: string, observacion: string) => Promise} props.onGuardar
 * @param {Function} props.onCancelar
 */
export default function CambioEstadoForm({ propiedad, onGuardar, onCancelar }) {
    const opciones = TRANSICIONES[propiedad.estado] ?? []
    const [estado, setEstado] = useState(opciones[0] ?? "")
    const [observacion, setObservacion] = useState("")
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const enviar = async (e) => {
        e.preventDefault()
        setError("")
        setEnviando(true)
        try {
            await onGuardar(estado, observacion.trim() || undefined)
        } catch (err) {
            setError(err.message)
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="space-y-4">
            <p className="text-sm text-smoke-700">
                <span className="font-semibold text-ink">{propiedad.titulo}</span> está{" "}
                <strong>{ESTADOS_PROPIEDAD[propiedad.estado]?.texto ?? propiedad.estado}</strong>.
            </p>

            {error && <p role="alert" className="px-4 py-3 rounded-lg bg-red-50 text-danger text-sm">{error}</p>}

            {opciones.length === 0 ? (
                <p className="text-sm">Este estado no tiene cambios disponibles.</p>
            ) : (
                <>
                    <label className="block text-sm font-medium text-smoke-700">
                        Nuevo estado
                        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg bg-white">
                            {opciones.map((opcion) => (
                                <option key={opcion} value={opcion}>{ESTADOS_PROPIEDAD[opcion].texto}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-smoke-700">
                        Observación (queda en la bitácora)
                        <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg" />
                    </label>
                </>
            )}

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancelar} className="py-2 px-4 rounded-lg border border-smoke-300 cursor-pointer">Cancelar</button>
                {opciones.length > 0 && (
                    <button type="submit" disabled={enviando} className="py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100 cursor-pointer disabled:opacity-60">
                        {enviando ? "Guardando..." : "Cambiar estado"}
                    </button>
                )}
            </div>
        </form>
    )
}
