import { Link } from "react-router-dom";
import PropertyCard from "../PropertyCard";
import FeaturedProperties from "./FeaturedProperties";

// The showcase shows 3 cards, the featured block, and 3 more cards
const POR_FILA = 3;

/**
 * "En vitrina" section of the home page: the newest published properties and,
 * in the middle, the featured block. The list arrives from LandingPage
 * (GET /api/catalogo, newest first).
 *
 * @param {Object} props
 * @param {Object[]|null} props.propiedades - Published properties; null while loading.
 * @param {string} props.error - Message if the catalog could not be loaded.
 */
function Feed({ propiedades, error }) {
    // Two featured ones go to the dark block; the cards show the others, so no
    // property appears twice
    const destacadas = (propiedades ?? []).filter((propiedad) => propiedad.destacada).slice(0, 2);
    const vitrina = (propiedades ?? [])
        .filter((propiedad) => !destacadas.includes(propiedad))
        .slice(0, POR_FILA * 2);

    return (
        <section className="max-w-[1200px] mx-auto px-5 pb-15">
            <div className="flex justify-between items-baseline gap-4">
                <h2 className="text-2xl font-bold">En vitrina</h2>
                {propiedades && propiedades.length > 0 && (
                    <Link to="/propiedades" className="text-sm text-smoke-900 hover:underline">
                        Ver las {propiedades.length} propiedades <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Link>
                )}
            </div>
            <hr className="mt-3.75 mb-7.5 h-px border-0 bg-linear-to-r from-smoke-500 to-transparent" />

            {error ? (
                <p role="alert" className="text-center text-danger bg-red-50 rounded-lg py-6 px-4">{error}</p>
            ) : propiedades === null ? (
                <p className="text-center text-smoke-700 py-16">Cargando propiedades...</p>
            ) : propiedades.length === 0 ? (
                <p className="text-center text-smoke-700 py-16">Pronto publicaremos nuevas propiedades.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6.25">
                    {vitrina.slice(0, POR_FILA).map((propiedad) => (
                        <PropertyCard key={propiedad._id} propiedad={propiedad} />
                    ))}
                    {destacadas.length > 0 && <FeaturedProperties propiedades={destacadas} />}
                    {vitrina.slice(POR_FILA).map((propiedad) => (
                        <PropertyCard key={propiedad._id} propiedad={propiedad} />
                    ))}
                </div>
            )}
        </section>
    )
}
export default Feed;
