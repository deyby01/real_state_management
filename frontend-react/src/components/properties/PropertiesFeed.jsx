import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertiesFilters from "./PropertiesFilters";
import PropertiesCatalog from "./PropertiesCatalog";
import { listarCatalogo } from "../../services/catalogo.service";
import { listarTiposPropiedad } from "../../services/tipoPropiedad.service";

// Every filter of GET /api/catalogo, empty: the form needs a value for each field
const FILTROS_VACIOS = { comuna: "", tipo: "", precioMin: "", precioMax: "", dormitorios: "", banos: "" };

/** Sorts a copy of the results. "recientes" keeps the API order (newest first). */
const ordenar = (propiedades, orden) => {
    const copia = [...propiedades];
    if (orden === "menor-precio") copia.sort((a, b) => a.valorArriendo - b.valorArriendo);
    if (orden === "mayor-precio") copia.sort((a, b) => b.valorArriendo - a.valorArriendo);
    return copia;
};

/**
 * Public catalog: filters + results from GET /api/catalogo (only PUBLICADA, RF5).
 *
 * The applied filters live in the URL (/propiedades?comuna=Ñuñoa&dormitorios=2),
 * not in a state: a search can be shared or bookmarked, the back button returns
 * to the previous search, and the landing page can link to a search.
 */
function Feed() {
    const [searchParams, setSearchParams] = useSearchParams();
    // A string is a stable effect dependency: it only changes when the search changes
    const consulta = searchParams.toString();
    const filtros = { ...FILTROS_VACIOS, ...Object.fromEntries(searchParams) };

    const [resultado, setResultado] = useState({ consulta: null, propiedades: [], error: "" });
    const [orden, setOrden] = useState("recientes");
    const [tipos, setTipos] = useState([]);
    const [comunas, setComunas] = useState([]);

    // Options of the selects, loaded once. If they fail, the selects only show
    // "Todos": the search itself still works and shows its own error
    useEffect(() => {
        listarTiposPropiedad().then(setTipos).catch(() => setTipos([]));
        listarCatalogo()
            .then((todas) => {
                const unicas = new Set(todas.map((propiedad) => propiedad.direccion.comuna));
                setComunas([...unicas].sort((a, b) => a.localeCompare(b, "es")));
            })
            .catch(() => setComunas([]));
    }, []);

    // One request per search. Same stale-answer guard as the detail page
    useEffect(() => {
        let vigente = true;
        listarCatalogo(Object.fromEntries(new URLSearchParams(consulta)))
            .then((propiedades) => vigente && setResultado({ consulta, propiedades, error: "" }))
            .catch((error) => vigente && setResultado({ consulta, propiedades: [], error: error.message }));
        return () => {
            vigente = false;
        };
    }, [consulta]);

    const cargando = resultado.consulta !== consulta;
    const propiedades = cargando ? null : ordenar(resultado.propiedades, orden);

    /** Writes the filters in the URL, without the empty ones; the effect does the search. */
    const buscar = (nuevos) => {
        setSearchParams(Object.fromEntries(Object.entries(nuevos).filter(([, valor]) => valor !== "")));
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6">
            <PropertiesFilters
                key={consulta}
                filtros={filtros}
                tipos={tipos}
                comunas={comunas}
                total={cargando || resultado.error ? null : resultado.propiedades.length}
                onBuscar={buscar}
            />
            <PropertiesCatalog
                propiedades={propiedades}
                error={cargando ? "" : resultado.error}
                orden={orden}
                onOrdenChange={setOrden}
            />
        </div>
    );
}
export default Feed;
