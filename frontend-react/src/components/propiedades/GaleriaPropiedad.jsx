import { useState } from "react"

/**
 * Image gallery of a property: one large image and clickable thumbnails.
 * Images are shown in their `orden`; with no images it shows a placeholder.
 *
 * @param {Object} props
 * @param {{ url: string, orden: number }[]} props.imagenes
 * @param {string} props.titulo - Used as the alt text.
 */
export default function GaleriaPropiedad({ imagenes, titulo }) {
    const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden)
    const [actual, setActual] = useState(0)

    if (ordenadas.length === 0) {
        return (
            <div className="h-72 md:h-96 rounded-xl bg-stone-200 flex items-center justify-center text-stone-500">
                <i className="fa-regular fa-image text-4xl"></i>
            </div>
        )
    }

    return (
        <div>
            <img
                src={ordenadas[actual].url}
                alt={`${titulo}, imagen ${actual + 1} de ${ordenadas.length}`}
                className="w-full h-72 md:h-96 object-cover rounded-xl"
            />
            {ordenadas.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                    {ordenadas.map((imagen, indice) => (
                        <button
                            key={imagen.url}
                            type="button"
                            onClick={() => setActual(indice)}
                            aria-label={`Ver imagen ${indice + 1}`}
                            className={`shrink-0 rounded-md overflow-hidden border-2 cursor-pointer ${
                                indice === actual ? "border-[#173f52]" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                        >
                            <img src={imagen.url} alt="" className="w-20 h-16 object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
