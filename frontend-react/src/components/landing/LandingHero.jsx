function Hero() {
    return (
        <section className="min-h-80 md:min-h-[50vh] bg-[url(/hero-background.jpg)] flex items-center bg-cover bg-center bg-no-repeat relative">
            <div className="absolute inset-0 bg-linear-to-r from-smoke-900/90 to-smoke-900/30"></div>
            <div className="relative max-w-[1200px] mx-auto px-5 text-smoke-100 w-full">
                <p className="mb-3.75 text-sm tracking-wide uppercase text-smoke-300">Región Metropolitana</p>
                <h1 className="max-w-175 text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.15]">
                    <span className="block">Encuentre dónde vivir.</span>
                    <span className="block">Nosotros nos encargamos</span>
                    <span className="block">del resto.</span>
                </h1>
            </div>
        </section>
    )
}
export default Hero;
