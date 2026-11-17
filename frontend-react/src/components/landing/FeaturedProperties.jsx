import { Link } from "react-router-dom";
import { formatearDireccion, formatearPrecio } from "../../utils/formato";

/**
 * Dark "Destacado" block of the home page: up to two properties marked
 * `destacada` (set by the executive). The text is built from the address and
 * the features, because properties have no description field.
 *
 * @param {Object} props
 * @param {Object[]} props.propiedades - Featured catalog properties (one or two).
 */
function FeaturedProperties({ propiedades }) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 col-span-full px-6.25 md:px-0 md:py-8.75 rounded-lg bg-smoke-900 text-smoke-100 divide-y md:divide-y-0 md:divide-x divide-smoke-100/15">
            {propiedades.map((propiedad) => (
                <article key={propiedad._id} className="flex flex-col py-6.25 md:py-0 md:px-10">
                    <p className="mb-3.5 text-xs font-semibold tracking-[2px] uppercase text-smoke-300">Destacado</p>
                    <h3 className="mb-3.5 text-2xl font-bold leading-tight uppercase">{propiedad.titulo}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-smoke-300">
                        {formatearDireccion(propiedad.direccion)}.
                        {propiedad.caracteristicas.length > 0 && ` ${propiedad.caracteristicas.join(", ")}.`}
                    </p>
                    <div className="flex items-baseline justify-between gap-3.75 mt-auto border-t border-smoke-100/15 pt-4.5">
                        <span className="text-[26px] font-bold">{formatearPrecio(propiedad.valorArriendo)}</span>
                        <span className="text-[13px] tracking-[1px] uppercase text-smoke-300">
                            {propiedad.dormitorios}D · {propiedad.banos}B · {propiedad.superficie} m²
                        </span>
                    </div>
                    <Link
                        to={`/propiedades/${propiedad._id}`}
                        className="p-2.75 rounded-md font-semibold text-center transition-colors duration-300 bg-smoke-100 text-smoke-900 mt-4 text-sm tracking-[1px] uppercase hover:bg-smoke-500 hover:text-smoke-100"
                    >
                        Ver propiedad
                    </Link>
                </article>
            ))}
        </section>
    )
}
export default FeaturedProperties;
