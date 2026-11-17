import { Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formato";

/**
 * Home page card of a published property (data from GET /api/catalogo).
 * The first image by `orden` is the cover; the button opens the detail page.
 *
 * @param {Object} props
 * @param {Object} props.propiedad - A catalog property.
 */
function PropertyCard({ propiedad }) {
    const portada = [...propiedad.imagenes].sort((a, b) => a.orden - b.orden)[0];
    const datos = [
        { label: "Dorm", value: propiedad.dormitorios },
        { label: "Baños", value: propiedad.banos },
        { label: "Superficie", value: `${propiedad.superficie} m²` },
    ];

    return (
        <article className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:-translate-y-1 hover:shadow-xl transition duration-300">
            {portada ? (
                <img className="w-full h-50 object-cover" src={portada.url} alt={propiedad.titulo} loading="lazy" />
            ) : (
                <div className="w-full h-50 bg-smoke-300 flex items-center justify-center text-smoke-500">
                    <i className="fa-regular fa-image text-3xl"></i>
                </div>
            )}
            <div className="flex flex-1 flex-col p-4.5">
                <div>
                    <p className="mb-1 text-xs text-smoke-700">
                        {propiedad.tipoId?.nombre} - {propiedad.direccion.comuna}
                    </p>
                    <h3 className="text-lg font-bold leading-snug">{propiedad.titulo}</h3>
                </div>
                <p className="mt-3 text-xl font-bold text-smoke-900">
                    {formatearPrecio(propiedad.valorArriendo)}
                    <small className="text-xs font-normal text-smoke-700"> / mes</small>
                </p>
                <hr className="border-0 my-3.5 h-px bg-smoke-300" />
                <ul className="grid grid-cols-3 text-center divide-x divide-smoke-300">
                    {datos.map((dato) => (
                        <li key={dato.label}>
                            <span className="block text-xs uppercase tracking-wide text-smoke-700">{dato.label}</span>
                            <span className="block mt-0.5 text-lg font-semibold">{dato.value}</span>
                        </li>
                    ))}
                </ul>
                <hr className="border-0 my-3.5 h-px bg-smoke-300" />
                <Link
                    to={`/propiedades/${propiedad._id}`}
                    className="p-2.75 mt-auto rounded-md font-semibold text-center transition-colors duration-300 bg-smoke-900 text-smoke-100 hover:bg-smoke-700"
                >
                    Ver detalles
                </Link>
            </div>
        </article>
    )
}
export default PropertyCard;
