import PropertiesCard from "./PropertiesCard";

/**
 * Result grid of the catalog with its three states: loading, error and empty.
 *
 * @param {Object} props
 * @param {Object[]|null} props.propiedades - Sorted results; null while loading.
 * @param {string} props.error - Message of the last failed search, or "".
 * @param {string} props.orden - "recientes" | "menor-precio" | "mayor-precio".
 * @param {Function} props.onOrdenChange
 */
function PropertiesCatalog({ propiedades, error, orden, onOrdenChange }) {
    return (
        <section className="py-10">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                <div>
                    <p className="text-stone-500 text-xs font-bold tracking-widest uppercase">Catálogo inmobiliario</p>
                    <h2 className="text-[#173f52] text-2xl font-semibold mt-1">Nuestras propiedades</h2>
                </div>
                <select
                    value={orden}
                    onChange={(e) => onOrdenChange(e.target.value)}
                    className="min-h-11 px-3 rounded-md border border-stone-300 text-stone-600 text-sm bg-white"
                    aria-label="Ordenar propiedades"
                >
                    <option value="recientes">Más recientes</option>
                    <option value="menor-precio">Menor precio</option>
                    <option value="mayor-precio">Mayor precio</option>
                </select>
            </div>

            {error ? (
                <p role="alert" className="text-center text-danger bg-red-50 rounded-lg py-6 px-4">{error}</p>
            ) : propiedades === null ? (
                <p className="text-center text-stone-500 py-16">Cargando propiedades...</p>
            ) : propiedades.length === 0 ? (
                <p className="text-center text-stone-500 py-16">
                    No encontramos propiedades que coincidan con tu búsqueda. Prueba con otros filtros.
                </p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {propiedades.map((propiedad) => (
                        <PropertiesCard key={propiedad._id} propiedad={propiedad} />
                    ))}
                </div>
            )}
        </section>
    )
}
export default PropertiesCatalog;
