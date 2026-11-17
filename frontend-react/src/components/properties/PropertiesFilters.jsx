import { useState } from "react";

const campoClass = "min-h-11 px-3 rounded-md border border-stone-300 font-normal text-stone-700 bg-white";
const labelClass = "flex flex-col gap-1.5 text-[#173f52] text-sm font-semibold";

/**
 * Catalog search form. What the user types is a draft (`borrador`): nothing is
 * searched until the form is submitted, so there is one request per search, not
 * one per key pressed. The field names are the query params of GET /api/catalogo.
 *
 * The parent renders it with key={the current search}: when the search changes
 * from outside (back button, a link), React creates a new form whose draft starts
 * from the new `filtros`.
 *
 * @param {Object} props
 * @param {Object} props.filtros - The applied search: comuna, tipo, precioMin, precioMax, dormitorios, banos.
 * @param {{ _id: string, nombre: string }[]} props.tipos - Property types for the select.
 * @param {string[]} props.comunas - Comunas that have published properties.
 * @param {number|null} props.total - Results of the last search (null while loading).
 * @param {Function} props.onBuscar - Receives the filters to apply ({} clears them).
 */
function PropertiesFilters({ filtros, tipos, comunas, total, onBuscar }) {
    const [borrador, setBorrador] = useState(filtros);

    const onChange = (e) => setBorrador({ ...borrador, [e.target.name]: e.target.value });
    const onSubmit = (e) => {
        e.preventDefault();
        onBuscar(borrador);
    };
    const onClear = () => onBuscar({});

    return (
        <section className="-mt-8 relative bg-white border border-stone-200 rounded-2xl shadow-md p-6">
            <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
                <div>
                    <p className="text-stone-500 text-xs font-bold tracking-widest uppercase">Búsqueda rápida</p>
                    <h2 className="text-[#173f52] text-xl font-semibold mt-1">Encuentra una propiedad</h2>
                </div>
                {total !== null && (
                    <span className="text-stone-500 text-sm">
                        {total} propiedad{total !== 1 && "es"} encontrada{total !== 1 && "s"}
                    </span>
                )}
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 items-end">
                <label className={labelClass}>
                    Comuna
                    <select name="comuna" value={borrador.comuna} onChange={onChange} className={campoClass}>
                        <option value="">Todas</option>
                        {comunas.map((comuna) => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                    </select>
                </label>

                <label className={labelClass}>
                    Tipo
                    <select name="tipo" value={borrador.tipo} onChange={onChange} className={campoClass}>
                        <option value="">Todos</option>
                        {tipos.map((tipo) => (
                            <option key={tipo._id} value={tipo._id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </label>

                <label className={labelClass}>
                    Precio mínimo
                    <input type="number" name="precioMin" min="0" step="50000" placeholder="$"
                        value={borrador.precioMin} onChange={onChange} className={campoClass} />
                </label>

                <label className={labelClass}>
                    Precio máximo
                    <input type="number" name="precioMax" min="0" step="50000" placeholder="$"
                        value={borrador.precioMax} onChange={onChange} className={campoClass} />
                </label>

                <label className={labelClass}>
                    Dormitorios
                    <select name="dormitorios" value={borrador.dormitorios} onChange={onChange} className={campoClass}>
                        <option value="">Cualquiera</option>
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                </label>

                <label className={labelClass}>
                    Baños
                    <select name="banos" value={borrador.banos} onChange={onChange} className={campoClass}>
                        <option value="">Cualquiera</option>
                        {[1, 2, 3].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                </label>

                <div className="flex gap-2 col-span-2 md:col-span-4 lg:col-span-1">
                    <button
                        type="submit"
                        aria-label="Buscar"
                        className="flex-1 min-h-11 bg-[#173f52] hover:bg-[#285f70] text-white font-semibold rounded-md transition cursor-pointer"
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                    <button
                        type="button"
                        onClick={onClear}
                        aria-label="Limpiar filtros"
                        title="Limpiar filtros"
                        className="flex-1 min-h-11 bg-stone-100 hover:bg-stone-200 text-[#173f52] font-semibold rounded-md transition cursor-pointer"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </form>
        </section>
    )
}
export default PropertiesFilters;
