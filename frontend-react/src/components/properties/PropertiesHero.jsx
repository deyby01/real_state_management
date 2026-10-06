function PropertiesHero() {
    return (
        <div
            className="text-white"
            style={{
                background:
                        "linear-gradient(110deg, rgba(31,31,31,.97), rgba(31,31,31,.88)), url('/oficina.jpg') center/cover",
            }}
        >
            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <p className="text-[#c7d7c3] text-xs font-bold tracking-widest uppercase mb-2">
                    Encuentra tu próximo hogar
                </p>
                <h1 className="text-4xl md:text-5xl font-semibold max-w-xl leading-tight">
                    Propiedades disponibles
                </h1>
                <p className="text-[#e0eceb] mt-3">Espacios seleccionados para vivir, trabajar y disfrutar.</p>
            </div>
        </div>
    )
}
export default PropertiesHero;
