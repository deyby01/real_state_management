import { useState } from "react"

const campoClass = "mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg bg-white text-ink"

/**
 * Controlled owner form shared by create and edit dialogs (CU2).
 * The page supplies the API operation; failures keep the entered values visible.
 *
 * @param {Object} props
 * @param {Object} [props.propietario] - Owner to edit; omit to start with empty fields.
 * @param {(datos: Object) => Promise} props.onGuardar - Saves the editable fields.
 * @param {Function} props.onCancelar - Closes the form.
 */
export default function PropietarioForm({ propietario, onGuardar, onCancelar }) {
    const [form, setForm] = useState(() => ({
        rut: propietario?.rut ?? "",
        nombre: propietario?.nombre ?? "",
        email: propietario?.email ?? "",
        telefono: propietario?.telefono ?? ""
    }))
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const cambiarCampo = (e) => {
        const { name, value } = e.target
        setForm((anterior) => ({ ...anterior, [name]: value }))
    }

    const enviar = async (e) => {
        e.preventDefault()
        if (enviando) return
        setError("")
        setEnviando(true)
        try {
            // Only business fields are submitted; activo and _id belong to the server.
            await onGuardar(form)
        } catch (err) {
            setError(err.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="space-y-4" aria-busy={enviando}>
            {error && (
                <p role="alert" className="px-4 py-3 rounded-lg bg-red-50 text-danger text-sm">
                    {error}
                </p>
            )}

            <fieldset disabled={enviando} className="grid gap-4 sm:grid-cols-2">
                <legend className="sr-only">Datos del propietario</legend>
                <label className="block text-sm font-medium text-smoke-700">
                    RUT
                    <input name="rut" value={form.rut} onChange={cambiarCampo} required placeholder="12.345.678-K" className={campoClass} />
                </label>
                <label className="block text-sm font-medium text-smoke-700">
                    Nombre
                    <input name="nombre" value={form.nombre} onChange={cambiarCampo} required autoComplete="name" className={campoClass} />
                </label>
                <label className="block text-sm font-medium text-smoke-700">
                    Email
                    <input name="email" type="email" value={form.email} onChange={cambiarCampo} required autoComplete="email" className={campoClass} />
                </label>
                <label className="block text-sm font-medium text-smoke-700">
                    Teléfono (opcional)
                    <input name="telefono" type="tel" value={form.telefono} onChange={cambiarCampo} autoComplete="tel" className={campoClass} />
                </label>
            </fieldset>

            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancelar} disabled={enviando} className="px-4 py-2 rounded-lg border border-smoke-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    Cancelar
                </button>
                <button type="submit" disabled={enviando} className="px-4 py-2 rounded-lg bg-ink text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {enviando ? "Guardando..." : propietario ? "Guardar cambios" : "Crear propietario"}
                </button>
            </div>
        </form>
    )
}
