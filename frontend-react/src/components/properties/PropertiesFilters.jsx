const selectClass = "min-h-11 px-3 rounded-md border border-stone-300 font-normal text-stone-700";
const labelClass = "flex flex-col gap-1.5 text-[#173f52] text-sm font-semibold";

function PropertiesFilters({ filters, total, onChange, onClear }) {
    return (
        <section className="-mt-8 relative bg-white border border-stone-200 rounded-2xl shadow-md p-6">
            <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
                <div>
                    <p className="text-stone-500 text-xs font-bold tracking-widest uppercase">Búsqueda rápida</p>
                    <h2 className="text-[#173f52] text-xl font-semibold mt-1">Encuentra una propiedad</h2>
                </div>
                <span className="text-stone-500 text-sm">
                    {total} propiedad{total !== 1 && "es"} encontrada{total !== 1 && "s"}
                </span>
            </div>

            <form className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <label className={labelClass}>
                    Operación
                    <select name="operation" value={filters.operation} onChange={onChange} className={selectClass}>
                        <option value="todos">Arriendo y venta</option>
                        <option value="arriendo">Arriendo</option>
                        <option value="venta">Venta</option>
                    </select>
                </label>

                <label className={labelClass}>
                    Tipo
                    <select name="type" value={filters.type} onChange={onChange} className={selectClass}>
                        <option value="todos">Todos los tipos</option>
                        <option value="casa">Casa</option>
                        <option value="departamento">Departamento</option>
                        <option value="oficina">Oficina</option>
                    </select>
                </label>

                <label className={labelClass}>
                    Región
                    <select name="region" value={filters.region} onChange={onChange} className={selectClass}>
                        <option value="todos">Todas</option>
                        <option value="metropolitana">Metropolitana</option>
                        <option value="valparaiso">Valparaíso</option>
                    </select>
                </label>

                <label className={labelClass}>
                    Estado
                    <select name="status" value={filters.status} onChange={onChange} className={selectClass}>
                        <option value="todos">Cualquiera</option>
                        <option value="disponible">Disponible</option>
                        <option value="reservada">Reservada</option>
                        <option value="arrendada">Arrendada</option>
                        <option value="vendida">Vendida</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={onClear}
                    className="min-h-11 bg-stone-100 hover:bg-stone-200 text-[#173f52] font-semibold rounded-md transition"
                >
                    Limpiar filtros
                </button>
            </form>
        </section>
    )
}
export default PropertiesFilters;
