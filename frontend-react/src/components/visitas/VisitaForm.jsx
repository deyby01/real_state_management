import { useState } from "react"

/**
 * Converts an ISO date from the API into the value format for <input type="datetime-local">.
 */
const aDatetimeLocal = (iso) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ""
    const pad = (n) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * Form to create a visit (executive books on behalf of the client) or reschedule one.
 *
 * @param {"crear"|"reprogramar"} modo
 * @param {Object} [visita] - Required when modo is reprogramar.
 * @param {Object[]} propiedades - PUBLICADA properties for the select (crear only).
 * @param {Object[]} clientes - Active clients for the select (crear only).
 * @param {(datos: Object) => Promise<void>} onGuardar
 * @param {() => void} onCancelar
 */
export default function VisitaForm({ modo, visita, propiedades = [], clientes = [], onGuardar, onCancelar }) {
    const [propiedadId, setPropiedadId] = useState("")
    const [clienteId, setClienteId] = useState("")
    const [fechaLocal, setFechaLocal] = useState(() =>
        modo === "reprogramar" && visita?.fechaInicio ? aDatetimeLocal(visita.fechaInicio) : ""
    )
    const [observaciones, setObservaciones] = useState(visita?.observaciones ?? "")
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const inputClass = "mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg"

    const enviar = async (event) => {
        event.preventDefault()
        setError("")

        if (!fechaLocal) {
            setError("Indica fecha y hora de la visita")
            return
        }

        const fechaInicio = new Date(fechaLocal)
        if (Number.isNaN(fechaInicio.getTime())) {
            setError("La fecha no es válida")
            return
        }

        const cuerpo =
            modo === "crear"
                ? {
                      propiedadId,
                      clienteId,
                      fechaInicio: fechaInicio.toISOString(),
                      ...(observaciones.trim() && { observaciones: observaciones.trim() }),
                  }
                : {
                      fechaInicio: fechaInicio.toISOString(),
                      ...(observaciones.trim() && { observaciones: observaciones.trim() }),
                  }

        if (modo === "crear") {
            if (!propiedadId || !clienteId) {
                setError("Selecciona propiedad y cliente")
                return
            }
        }

        setEnviando(true)
        try {
            await onGuardar(cuerpo)
        } catch (err) {
            setError(err.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="space-y-4">
            {modo === "reprogramar" && (
                <p className="text-sm text-smoke-700">
                    <strong>{visita?.propiedadId?.titulo}</strong>
                    <br />
                    Cliente: {visita?.clienteId?.nombre ?? "—"} · Estado: {visita?.estado}
                </p>
            )}

            {modo === "crear" && (
                <>
                    <label className="block text-sm">
                        <span className="font-medium">Propiedad (publicada)</span>
                        <select
                            value={propiedadId}
                            onChange={(e) => setPropiedadId(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Selecciona…</option>
                            {propiedades.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.titulo}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm">
                        <span className="font-medium">Cliente</span>
                        <select
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Selecciona…</option>
                            {clientes.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.nombre} ({c.email})
                                </option>
                            ))}
                        </select>
                    </label>
                </>
            )}

            <label className="block text-sm">
                <span className="font-medium">Fecha y hora de inicio</span>
                <input
                    type="datetime-local"
                    value={fechaLocal}
                    onChange={(e) => setFechaLocal(e.target.value)}
                    required
                    className={inputClass}
                />
            </label>

            <label className="block text-sm">
                <span className="font-medium">Observaciones (opcional)</span>
                <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className={inputClass}
                />
            </label>

            {error && (
                <p role="alert" className="text-sm text-danger">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancelar}
                    disabled={enviando}
                    className="px-4 py-2 text-sm rounded-lg border border-smoke-300 hover:bg-canvas cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={enviando}
                    className="px-4 py-2 text-sm rounded-lg bg-smoke-900 text-smoke-100 hover:bg-smoke-700 cursor-pointer disabled:opacity-50"
                >
                    {enviando ? "Guardando…" : modo === "crear" ? "Agendar visita" : "Guardar nueva fecha"}
                </button>
            </div>
        </form>
    )
}