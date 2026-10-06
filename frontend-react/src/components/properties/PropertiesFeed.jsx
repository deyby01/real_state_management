import { useState, useMemo } from "react";
import PropertiesFilters from "./PropertiesFilters";
import PropertiesCatalog from "./PropertiesCatalog";

const properties = [
    {
    id: 1,
    operation: "arriendo",
    type: "casa",
    region: "metropolitana",
    location: "La Reina · Región Metropolitana",
    title: "Alonso de Camargo 890",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    price: 1450000,
    status: "disponible",
    tag: "Destacada",
    image: "/casa1.jpg",
    dateAdded: "2026-09-01"
  },
  {
    id: 2,
    operation: "arriendo",
    type: "departamento",
    region: "metropolitana",
    location: "Providencia · Región Metropolitana",
    title: "Av. Los Leones 1240",
    bedrooms: 2,
    bathrooms: 2,
    area: 68,
    price: 680000,
    status: "disponible",
    tag: "Disponible",
    image: "/departamento1.jpg",
    dateAdded: "2026-08-20"
  },
  {
    id: 3,
    operation: "arriendo",
    type: "oficina",
    region: "metropolitana",
    location: "Las Condes · Región Metropolitana",
    title: "Apoquindo 4501, of 802",
    office: 4,
    bathrooms: 2,
    area: 96,
    price: 1200000,
    status: "reservada",
    tag: "Comercial",
    image: "/oficina.jpg",
    dateAdded: "2026-08-15"
  },
  {
    id: 4,
    operation: "venta",
    type: "departamento",
    region: "valparaiso",
    location: "Viña del Mar · Región de Valparaíso",
    title: "Calle Los Sargazos 415, Jardín del Mar",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    price: 195000000,
    status: "disponible",
    tag: "Nueva",
    image: "/casa3.jpg",
    dateAdded: "2026-09-03"
  },
  {
    id: 5,
    operation: "arriendo",
    type: "departamento",
    region: "metropolitana",
    location: "Santiago Centro · Región Metropolitana",
    title: "Irarrazabal 3320, depto 502",
    bedrooms: 1,
    bathrooms: 1,
    area: 44,
    price: 520000,
    status: "arrendada",
    tag: "Oportunidad",
    image: "/departamento2.jpg",
    dateAdded: "2026-07-28"
  }
]

const initialFilters = { operation: "todos", type: "todos", region: "todos", status: "todos" };

function Feed() {
    const [filters, setFilters] = useState(initialFilters);
    const [sortBy, setSortBy] = useState("recientes");

    function handleFilterChange(event) {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    }

    function handleClearFilters() {
        setFilters(initialFilters);
    }

    const filteredProperties = useMemo(() => {
        const result = properties.filter((p) => {
            if (filters.operation !== "todos" && p.operation !== filters.operation) return false;
            if (filters.type !== "todos" && p.type !== filters.type) return false;
            if (filters.region !== "todos" && p.region !== filters.region) return false;
            if (filters.status !== "todos" && p.status !== filters.status) return false;
            return true;
        });

        const sorted = [...result];
        if (sortBy === "menor-precio") sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === "mayor-precio") sorted.sort((a, b) => b.price - a.price);
        else sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        return sorted;
    }, [filters, sortBy]);

    return (
        <div className="container mx-auto px-6 max-w-6xl">
            <PropertiesFilters
                filters={filters}
                total={filteredProperties.length}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />
            <PropertiesCatalog
                properties={filteredProperties}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />
        </div>
    )
}
export default Feed;