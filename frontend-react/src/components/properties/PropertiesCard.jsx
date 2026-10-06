const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
});

const estadoEstilos = {
    disponible: "bg-green-100 text-green-700",
    reservada: "bg-yellow-100 text-yellow-700",
    arrendada: "bg-orange-100 text-orange-700",
    vendida: "bg-rose-100 text-rose-700",
};

const estadoTexto = {
    disponible: "Disponible",
    reservada: "Reservada",
    arrendada: "Arrendada",
    vendida: "Vendida",
};

function PropertiesCard({ property }) {
    const unidad = property.operation === "arriendo" ? " / mes" : "";

    return (
        <article className="bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 overflow-hidden">
            <div className="relative h-56">
                <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
                <span
                    className={`absolute top-4 left-4 px-2.5 py-1 rounded-md text-xs font-bold ${estadoEstilos[property.status]}`}
                >
                    {estadoTexto[property.status]}
                </span>
            </div>

            <div className="p-5">
                <p className="text-emerald-700 text-sm font-bold mb-1">{property.location}</p>
                <h3 className="text-[#173f52] text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-stone-500 text-sm">
                    {property.bedrooms > 0 && <>{property.bedrooms} dormitorios <span className="mx-1 text-stone-300">·</span></>}
                    {property.office > 0 && <>{property.office} privados <span className="mx-1 text-stone-300">·</span></>}
                    {property.bathrooms} baños <span className="mx-1 text-stone-300">·</span> {property.area} m²
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                    <p className="text-[#ad654a] text-lg font-bold">
                        {formatoCLP.format(property.price)}
                        <small className="text-stone-400 text-xs font-normal">{unidad}</small>
                    </p>
                    <a
                        href={`#propiedad-${property.id}`}
                        className="bg-[#173f52] hover:bg-[#285f70] text-white text-sm font-semibold px-4 py-2 rounded-md transition"
                    >
                        Ver detalles
                    </a>
                </div>
            </div>
        </article>
    )
}
export default PropertiesCard;
