import PropertiesCard from "./PropertiesCard";

function PropertiesCatalog({ properties, sortBy, onSortChange }) {
    return (
        <section className="py-10">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                <div>
                    <p className="text-stone-500 text-xs font-bold tracking-widest uppercase">Catálogo inmobiliario</p>
                    <h2 className="text-[#173f52] text-2xl font-semibold mt-1">Nuestras propiedades</h2>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="min-h-11 px-3 rounded-md border border-stone-300 text-stone-600 text-sm"
                    aria-label="Ordenar propiedades"
                >
                    <option value="recientes">Más recientes</option>
                    <option value="menor-precio">Menor precio</option>
                    <option value="mayor-precio">Mayor precio</option>
                </select>
            </div>

            {properties.length === 0 ? (
                <p className="text-center text-stone-500 py-16">
                    No encontramos propiedades que coincidan con tu búsqueda. Prueba con otros filtros.
                </p>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <PropertiesCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </section>
    )
}
export default PropertiesCatalog;
