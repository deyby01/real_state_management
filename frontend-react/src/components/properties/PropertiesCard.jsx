import { Link } from "react-router-dom"
import { formatearPrecio } from "../../utils/formato"

/**
 * Catalog card of a published property (data from GET /api/catalogo).
 * The first image by `orden` is the cover; the whole card links to the detail page.
 *
 * @param {Object} props
 * @param {Object} props.propiedad - A catalog property: _id, titulo, tipoId.nombre, direccion,
 *   superficie, dormitorios, banos, valorArriendo, imagenes, destacada.
 */
function PropertiesCard({ propiedad }) {
    const portada = [...propiedad.imagenes].sort((a, b) => a.orden - b.orden)[0]

    return (
        <article className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col">
            <div className="relative h-56 bg-stone-200">
                {portada ? (
                    <img
                        src={portada.url}
                        alt={propiedad.titulo}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <i className="fa-regular fa-image text-3xl"></i>
                    </div>
                )}
                <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold bg-white/90 text-[#173f52]">
                    {propiedad.tipoId?.nombre}
                </span>
                {propiedad.destacada && (
                    <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-xs font-bold bg-[#ad654a] text-white">
                        Destacada
                    </span>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <p className="text-emerald-700 text-sm font-bold mb-1">
                    {propiedad.direccion.comuna} · {propiedad.direccion.ciudad}
                </p>
                <h3 className="text-[#173f52] text-xl font-semibold mb-2">{propiedad.titulo}</h3>
                <p className="text-stone-500 text-sm">
                    {propiedad.dormitorios > 0 && (
                        <>{propiedad.dormitorios} dorm. <span className="mx-1 text-stone-300">·</span></>
                    )}
                    {propiedad.banos} baños <span className="mx-1 text-stone-300">·</span> {propiedad.superficie} m²
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-200">
                    <p className="text-[#ad654a] text-lg font-bold">
                        {formatearPrecio(propiedad.valorArriendo)}
                        <small className="text-stone-400 text-xs font-normal"> / mes</small>
                    </p>
                    <Link
                        to={`/propiedades/${propiedad._id}`}
                        className="bg-[#173f52] hover:bg-[#285f70] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
                    >
                        Ver detalles
                    </Link>
                </div>
            </div>
        </article>
    )
}
export default PropertiesCard;
