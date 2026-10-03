const highlights = [
    {
        id: 1,
        title: "Padre Hurtado Norte 1560, Vitacura",
        description: "Casa de dos pisos con jardin de 320 m², sala de estar independiente y estacionamiento para tres autos. Recién repintada y disponible para entrega inmediata.",
        price: "$2.300.000",
        meta: "5D · 4B · 260 m²",
    },
    {
        id: 2,
        title: "Isidora Goyenechea 3200, Las Condes",
        description: "Piso alto con vista al cerro, cocina equipada y bodega. Edificio con consergeria las veinticuatro horas.",
        price: "$1.680.000",
        meta: "3D · 2B · 118 m²",
    }
]

function FeaturedProperties() {
    return (
        <section className="grid grid-cols-2 col-span-full py-8.75 rounded-lg bg-smoke-900 text-smoke-100 divide-x divide-smoke-100/15">
            {highlights.map((hproperty) => (
                <article key={hproperty.id} className="flex flex-col px-10">
                    <p className="mb-3.5 text-xs font-semibold tracking-[2px] uppercase text-smoke-300">Destacado</p>
                    <h3 className="mb-3.5 text-2xl font-bold leading-tight uppercase">{hproperty.title}</h3>
                    <p className="mb-5 text-sm leading-relaxed text-smoke-300">{hproperty.description}</p>
                    <div className="flex items-baseline justify-between gap-3.75 mt-auto border-t border-smoke-100/15 pt-4.5">
                        <span className="text-[26px] font-bold">{hproperty.price}</span>
                        <span className="text-[13px] tracking-[1px] uppercase text-smoke-300">{hproperty.meta}</span>
                    </div>
                    <a className="p-2.75 rounded-md font-semibold text-center transition-colors duration-300 bg-smoke-100 text-smoke-900 mt-4 text-sm tracking-[1px] uppercase hover:bg-smoke-500 hover:text-smoke-100" href="#">Contactar</a>
                </article>
            ))}
        </section>
    )
}
export default FeaturedProperties;
