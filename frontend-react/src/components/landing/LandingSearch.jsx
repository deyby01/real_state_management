import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarTiposPropiedad } from "../../services/tipoPropiedad.service";

const selectClass = "py-2.5 px-3 border border-smoke-300 rounded-md bg-white text-ink cursor-pointer";
const labelClass = "flex flex-1 flex-col gap-1.5 text-xs font-semibold text-smoke-700";

/**
 * Quick search of the home page. It does not search by itself: it sends the
 * user to the catalog with the filters in the URL (/propiedades?comuna=...),
 * where the catalog page runs the search.
 *
 * @param {Object} props
 * @param {Object[]} props.propiedades - Published properties, to offer only comunas that have results.
 */
function Search({ propiedades }) {
    const navegar = useNavigate();
    const [tipos, setTipos] = useState([]);
    const [busqueda, setBusqueda] = useState({ tipo: "", comuna: "", dormitorios: "" });

    // If the types cannot be loaded, the select only offers "Todos"
    useEffect(() => {
        listarTiposPropiedad().then(setTipos).catch(() => setTipos([]));
    }, []);

    const comunas = [...new Set(propiedades.map((propiedad) => propiedad.direccion.comuna))]
        .sort((a, b) => a.localeCompare(b, "es"));

    const cambiarCampo = (e) => setBusqueda({ ...busqueda, [e.target.name]: e.target.value });

    const buscar = (e) => {
        e.preventDefault();
        // Same rule as the catalog: empty filters are not written in the URL
        const params = new URLSearchParams(
            Object.entries(busqueda).filter(([, valor]) => valor !== "")
        );
        const query = params.toString();
        navegar(query ? `/propiedades?${query}` : "/propiedades");
    };

    return (
        <section className="max-w-[1000px] mx-auto px-5 pb-15">
            <form onSubmit={buscar} className="flex flex-col md:flex-row gap-3.75 p-5 bg-smoke-100 rounded-lg shadow-lg -mt-7.5 md:-mt-10 relative md:items-end">
                <label className={labelClass}>
                    Tipo
                    <select className={selectClass} name="tipo" value={busqueda.tipo} onChange={cambiarCampo}>
                        <option value="">Todos</option>
                        {tipos.map((tipo) => (
                            <option key={tipo._id} value={tipo._id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </label>

                <label className={labelClass}>
                    Comuna
                    <select className={selectClass} name="comuna" value={busqueda.comuna} onChange={cambiarCampo}>
                        <option value="">Todas</option>
                        {comunas.map((comuna) => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                    </select>
                </label>

                <label className={labelClass}>
                    Dormitorios
                    <select className={selectClass} name="dormitorios" value={busqueda.dormitorios} onChange={cambiarCampo}>
                        <option value="">Cualquiera</option>
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
                    </select>
                </label>

                <button className="flex items-center justify-center gap-2 font-semibold py-2.75 px-6 border border-smoke-300 bg-smoke-900 text-smoke-100 rounded-md cursor-pointer hover:bg-smoke-700 transition-colors duration-300" type="submit">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Buscar
                </button>
            </form>
        </section>
    )
}
export default Search;
