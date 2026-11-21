import { useState } from "react"

const campoClass = "mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg bg-white text-ink"
const labelClass = "block text-sm font-medium text-smoke-700"

/**
 * Stored RUT format (docs/DATA_MODEL.md): 7 or 8 digits, hyphen and check digit,
 * which can be a digit or K. Dots are optional because the backend removes them.
 * The pattern is checked by the browser before submitting; the backend normalizes.
 */
const PATRON_RUT = "\\d{1,2}(\\.?\\d{3}){2}-[\\dK]"

/** Drops any character a RUT cannot contain and uppercases the K. */
const limpiarRut = (valor) => valor.replace(/[^\dkK.-]/g, "").toUpperCase()

/** Client fields shown in the form, with "" when the document has no value. */
const aFormulario = (cliente) => ({
    rut: cliente?.rut ?? "",
    nombre: cliente?.nombre ?? "",
    email: cliente?.email ?? "",
    telefono: cliente?.telefono ?? "",
    ciudad: cliente?.ciudad ?? "",
    comuna: cliente?.comuna ?? "",
})

/**
 * The body the API accepts. `_id`, `estado` and `activo` are left out on purpose:
 * the server decides them (a new client is always INTERESADO).
 */
const aApi = (form) => ({
    rut: form.rut.trim(),
    nombre: form.nombre.trim(),
    email: form.email.trim(),
    telefono: form.telefono.trim(),
    ciudad: form.ciudad.trim(),
    comuna: form.comuna.trim(),
})

/**
 * Create/edit form of a client. It does not call the API: it hands the body to
 * `onGuardar`, which the page connects to crearCliente or actualizarCliente, and
 * shows the API's Spanish message if that promise fails (400 invalid data, 409
 * duplicate RUT or email).
 *
 * @param {Object} props
 * @param {Object} [props.cliente] - The client to edit; omit it to create.
 * @param {(datos: Object) => Promise} props.onGuardar
 * @param {Function} props.onCancelar
 */
export default function ClienteForm({ cliente, onGuardar, onCancelar }) {
    const [form, setForm] = useState(() => aFormulario(cliente))
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const cambiarCampo = (e) => {
        const { name, value } = e.target
        // The RUT is filtered as it is typed: letters are dropped and the K is uppercased
        setForm({ ...form, [name]: name === "rut" ? limpiarRut(value) : value })
    }

    const enviar = async (e) => {
        e.preventDefault()
        setError("")
        setEnviando(true)
        try {
            await onGuardar(aApi(form))
        } catch (err) {
            setError(err.message)
            setEnviando(false)
        }
    }

    const campo = (name, texto, props = {}) => (
        <label className={labelClass}>
            {texto}
            <input name={name} value={form[name]} onChange={cambiarCampo} className={campoClass} {...props} />
        </label>
    )

    return (
        <form onSubmit={enviar} className="space-y-4">
            {error && (
                <p role="alert" className="px-4 py-3 rounded-lg bg-red-50 text-danger text-sm">{error}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
                <label className={labelClass}>
                    RUT
                    <input
                        name="rut"
                        value={form.rut}
                        onChange={cambiarCampo}
                        className={campoClass}
                        required
                        maxLength={12}
                        pattern={PATRON_RUT}
                        title="Formato: 12.345.678-9 (los puntos son opcionales)"
                        placeholder="12.345.678-9"
                        autoComplete="off"
                    />
                    <span className="block mt-1 text-xs text-smoke-500">Se guarda sin puntos: 12345678-9</span>
                </label>
                {campo("nombre", "Nombre completo", { required: true })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {campo("email", "Email", { type: "email", required: true })}
                {campo("telefono", "Teléfono", { type: "tel", placeholder: "+56 9 1234 5678" })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {campo("ciudad", "Ciudad")}
                {campo("comuna", "Comuna")}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onCancelar} className="py-2 px-4 rounded-lg border border-smoke-300 cursor-pointer">
                    Cancelar
                </button>
                <button type="submit" disabled={enviando} className="py-2 px-4 rounded-lg bg-smoke-900 text-smoke-100 cursor-pointer disabled:opacity-60 disabled:cursor-wait">
                    {enviando ? "Guardando..." : "Guardar"}
                </button>
            </div>
        </form>
    )
}
