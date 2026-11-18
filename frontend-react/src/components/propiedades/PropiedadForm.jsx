import { useState } from "react"

const campoClass = "mt-1 w-full px-3 py-2 border border-smoke-300 rounded-lg bg-white text-ink"
const labelClass = "block text-sm font-medium text-smoke-700"

/**
 * Turns a property from the API into the form's values. Lists become text:
 * features separated by commas, one image URL per line.
 */
const aFormulario = (propiedad) => ({
    titulo: propiedad?.titulo ?? "",
    tipoId: propiedad?.tipoId?._id ?? "",
    calle: propiedad?.direccion?.calle ?? "",
    numero: propiedad?.direccion?.numero ?? "",
    comuna: propiedad?.direccion?.comuna ?? "",
    ciudad: propiedad?.direccion?.ciudad ?? "",
    superficie: propiedad?.superficie ?? "",
    dormitorios: propiedad?.dormitorios ?? 0,
    banos: propiedad?.banos ?? 1,
    estacionamientos: propiedad?.estacionamientos ?? 0,
    valorArriendo: propiedad?.valorArriendo ?? "",
    gastosComunes: propiedad?.gastosComunes ?? 0,
    caracteristicas: (propiedad?.caracteristicas ?? []).join(", "),
    imagenes: [...(propiedad?.imagenes ?? [])].sort((a, b) => a.orden - b.orden).map((imagen) => imagen.url).join("\n"),
    destacada: propiedad?.destacada ?? false,
})

/**
 * The opposite of aFormulario: the body the API expects. Numbers are sent as
 * numbers (rule 10), `direccion` goes complete (the PUT replaces it whole) and the
 * image order is the order of the lines.
 */
const aApi = (form) => ({
    titulo: form.titulo,
    tipoId: form.tipoId,
    direccion: { calle: form.calle, numero: form.numero, comuna: form.comuna, ciudad: form.ciudad },
    superficie: Number(form.superficie),
    dormitorios: Number(form.dormitorios),
    banos: Number(form.banos),
    estacionamientos: Number(form.estacionamientos),
    valorArriendo: Number(form.valorArriendo),
    gastosComunes: Number(form.gastosComunes),
    caracteristicas: form.caracteristicas.split(",").map((texto) => texto.trim()).filter(Boolean),
    imagenes: form.imagenes.split("\n").map((url) => url.trim()).filter(Boolean).map((url, orden) => ({ url, orden })),
    destacada: form.destacada,
})

/**
 * Create/edit form of a property. It does not call the API: it hands the body to
 * `onGuardar`, which the page connects to crearPropiedad or actualizarPropiedad,
 * and shows the API's error message if that promise fails.
 *
 * @param {Object} props
 * @param {Object} [props.propiedad] - The property to edit; omit it to create.
 * @param {{ _id: string, nombre: string }[]} props.tipos
 * @param {(datos: Object) => Promise} props.onGuardar
 * @param {Function} props.onCancelar
 */
export default function PropiedadForm({ propiedad, tipos, onGuardar, onCancelar }) {
    const [form, setForm] = useState(() => aFormulario(propiedad))
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    const cambiarCampo = (e) => {
        const { name, value, type, checked } = e.target
        setForm({ ...form, [name]: type === "checkbox" ? checked : value })
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
                {campo("titulo", "Título", { required: true })}
                <label className={labelClass}>
                    Tipo
                    <select name="tipoId" value={form.tipoId} onChange={cambiarCampo} required className={campoClass}>
                        <option value="">Selecciona un tipo</option>
                        {tipos.map((tipo) => (
                            <option key={tipo._id} value={tipo._id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </label>
            </div>

            <fieldset className="grid sm:grid-cols-4 gap-4">
                <legend className="text-sm font-semibold mb-1">Dirección</legend>
                <div className="sm:col-span-2">{campo("calle", "Calle", { required: true })}</div>
                {campo("numero", "Número")}
                {campo("comuna", "Comuna", { required: true })}
                <div className="sm:col-span-2">{campo("ciudad", "Ciudad", { required: true })}</div>
            </fieldset>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {campo("superficie", "Superficie (m²)", { type: "number", min: 1, required: true })}
                {campo("dormitorios", "Dormitorios", { type: "number", min: 0, required: true })}
                {campo("banos", "Baños", { type: "number", min: 0, required: true })}
                {campo("estacionamientos", "Estacionamientos", { type: "number", min: 0 })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {campo("valorArriendo", "Arriendo mensual ($)", { type: "number", min: 0, step: 1000, required: true })}
                {campo("gastosComunes", "Gastos comunes ($)", { type: "number", min: 0, step: 1000 })}
            </div>

            {campo("caracteristicas", "Características (separadas por coma)", { placeholder: "Balcón, Bodega, Cerca del metro" })}

            <label className={labelClass}>
                Imágenes (una URL por línea; la primera es la portada)
                <textarea name="imagenes" value={form.imagenes} onChange={cambiarCampo} rows={3} className={`${campoClass} font-mono text-xs`} />
            </label>

            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="destacada" checked={form.destacada} onChange={cambiarCampo} />
                Destacada en la página de inicio
            </label>

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
