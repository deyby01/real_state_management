import PropertyCard from "./PropertyCard";
import FeaturedProperties from "./FeaturedProperties";

const properties = [
    {
        id: 1,
        image: "/departamento1.jpg",
        alt: "Departamento en Providencia",
        kind: "Departamento - Providencia",
        title: "Av. Los Leones 1240",
        price: "$680.000",
        specs: [
            { label: "Dorm", value: "2" },
            { label: "Baños", value: "2" },
            { label: "Superficie", value: "68 m²" }
        ],
    },
    {
        id: 2,
        image: "/casa1.jpg",
        alt: "Casa en La Reina",
        kind: "Casa - La Reina",
        title: "Alonso de Camargo 890",
        price: "$1.450.000",
        specs: [
            { label: "Dorm", value: "4" },
            { label: "Baños", value: "3" },
            { label: "Superficie", value: "180 m²" }
        ],
    },
    {
        id: 3,
        image: "/oficina.jpg",
        alt: "Oficina en Las Condes",
        kind: "Oficina - Las Condes",
        title: "Apoquindo 4501, of. 802",
        price: "$1.120.000",
        specs: [
            { label: "Privados", value: "4" },
            { label: "Baños", value: "2" },
            { label: "Superficie", value: "96 m²" }
        ],
    },
    {
        id: 4,
        image: "/departamento2.jpg",
        alt: "Departamento en Nuñoa",
        kind: "Departamento - Ñuñoa",
        title: "Irarrazabal 3320",
        price: "$520.000",
        specs: [
            { label: "Dorm", value: "1" },
            { label: "Baños", value: "1" },
            { label: "Superficie", value: "44 m²" }
        ],
    },
    {
        id: 5,
        image: "/departamento1.jpg",
        alt: "Departamento en Santiago Centro",
        kind: "Departamento - Santiago",
        title: "Moneda 1170",
        price: "$430.000",
        specs: [
            { label: "Dorm", value: "2" },
            { label: "Baños", value: "1" },
            { label: "Superficie", value: "52 m²" }
        ],
    },
    {
        id: 6,
        image: "/casa2.jpg",
        alt: "Casa en Peñalolen",
        kind: "Casa - Peñalolén",
        title: "Consistorial 2745",
        price: "$980.000",
        specs: [
            { label: "Dorm", value: "3" },
            { label: "Baños", value: "2" },
            { label: "Superficie", value: "128 m²" }
        ],
    },
]

function Feed() {
    return (
        <section className="max-w-[1200px] mx-auto px-5">
            <div className="flex justify-between items-baseline">
                <h2 className="text-2xl font-bold">En vitrina</h2>
                <p className="text-sm text-smoke-900">8 propiedades</p>
            </div>
            <hr className="mt-3.75 mb-7.5 h-px border-0 bg-linear-to-r from-smoke-500 to-transparent" />
            <div className="grid grid-cols-3 gap-6.25">
                {properties.slice(0, 3).map((property) => (
                    <PropertyCard key={property.id} image={property.image} alt={property.alt} kind={property.kind} title={property.title} price={property.price} specs={property.specs} />
                ))}
                <FeaturedProperties />
                {properties.slice(3).map((property) => (
                    <PropertyCard key={property.id} image={property.image} alt={property.alt} kind={property.kind} title={property.title} price={property.price} specs={property.specs} />
                ))}
            </div>
        </section>
    )
}
export default Feed;
