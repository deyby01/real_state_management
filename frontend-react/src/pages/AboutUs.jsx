import Header from "../components/Header";
import Footer from "../components/Footer";

import heroAbout from "../assets/about/hero-about.png";
import infoAbout from "../assets/about/info-about.png";
import gupAbout from "../assets/about/GUP-about.png";

function AboutUs() {
    return (
        <div className="min-h-screen font-medium text-ink bg-canvas">

            <Header />

            <main>

                {/* HERO */}
                <section className="bg-white">
                    <div className="grid min-h-[650px] lg:grid-cols-2">

                        {/* Texto */}
                        <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
                            <div className="max-w-xl">

                                <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-accent-500">
                                    Gestión Urbana de Propiedades
                                </p>

                                <h1 className="text-4xl font-bold leading-[1.1] text-smoke-900 sm:text-5xl lg:text-6xl">
                                    Más que
                                    <br />
                                    propiedades,
                                    <br />
                                    construimos
                                    <br />
                                    confianza.
                                </h1>

                                <p className="mt-7 max-w-lg text-base leading-7 text-smoke-600 md:text-lg">
                                    Acompañamos a propietarios y arrendatarios durante
                                    todo el proceso inmobiliario con una gestión cercana,
                                    transparente y eficiente.
                                </p>

                                <a
                                    href="#nosotros"
                                    className="mt-8 inline-flex items-center gap-3 rounded-md bg-smoke-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-smoke-700"
                                >
                                    Conócenos
                                    <span>→</span>
                                </a>

                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="relative min-h-[420px] lg:min-h-full">
                            <img
                                src={heroAbout}
                                alt="Vista urbana y proyecto inmobiliario"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/10"></div>
                        </div>

                    </div>
                </section>


                {/* QUIÉNES SOMOS */}
                <section
                    id="nosotros"
                    className="px-5 py-20 md:py-28"
                >
                    <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-20">

                        {/* Imagen */}
                        <div className="relative">
                            <img
                                src={infoAbout}
                                alt="Asesoría inmobiliaria"
                                className="h-[420px] w-full rounded-lg object-cover md:h-[560px]"
                            />

                            <div className="absolute -bottom-6 -right-3 hidden rounded-lg bg-smoke-900 px-8 py-6 text-white shadow-xl md:block">
                                <p className="text-3xl font-bold">
                                    GUP
                                </p>

                                <p className="mt-1 text-sm text-smoke-300">
                                    Gestión Urbana
                                    <br />
                                    de Propiedades
                                </p>
                            </div>
                        </div>


                        {/* Texto */}
                        <div>
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-500">
                                Nosotros
                            </p>

                            <h2 className="text-3xl font-bold leading-tight text-smoke-900 md:text-5xl">
                                Una gestión inmobiliaria pensada en las personas.
                            </h2>

                            <p className="mt-7 leading-7 text-smoke-600">
                                En Gestión Urbana de Propiedades trabajamos para
                                simplificar la administración y búsqueda de propiedades,
                                conectando a personas con espacios que respondan a sus
                                necesidades.
                            </p>

                            <p className="mt-5 leading-7 text-smoke-600">
                                Nuestro objetivo es entregar información clara,
                                acompañamiento y una experiencia confiable durante cada
                                etapa del proceso inmobiliario.
                            </p>

                            <div className="mt-10 border-l-4 border-accent-500 pl-6">
                                <p className="text-xl font-semibold leading-8 text-smoke-900">
                                    “Cada propiedad representa una decisión importante.
                                    Nuestro trabajo es hacer ese proceso más simple.”
                                </p>
                            </div>
                        </div>

                    </div>
                </section>


                {/* VALORES */}
                <section className="bg-white px-5 py-20 md:py-28">
                    <div className="mx-auto max-w-[1200px]">

                        <div className="mb-14 max-w-2xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-500">
                                Nuestra forma de trabajar
                            </p>

                            <h2 className="text-3xl font-bold text-smoke-900 md:text-5xl">
                                Lo que nos representa.
                            </h2>

                            <p className="mt-5 leading-7 text-smoke-600">
                                Construimos relaciones basadas en la confianza y
                                acompañamos cada decisión con una gestión profesional.
                            </p>
                        </div>


                        <div className="grid gap-10 md:grid-cols-3">

                            <article className="border-t-2 border-accent-500 pt-6">

                                <h3 className="my-4 text-2xl font-bold text-smoke-900">
                                    Cercanía
                                </h3>

                                <p className="leading-7 text-smoke-600">
                                    Escuchamos y comprendemos las necesidades de cada
                                    persona para entregar una atención personalizada.
                                </p>
                            </article>


                            <article className="border-t-2 border-accent-500 pt-6">

                                <h3 className="my-4 text-2xl font-bold text-smoke-900">
                                    Transparencia
                                </h3>

                                <p className="leading-7 text-smoke-600">
                                    Entregamos información clara y mantenemos una
                                    comunicación directa durante todo el proceso.
                                </p>
                            </article>


                            <article className="border-t-2 border-accent-500 pt-6">
                          
                                <h3 className="my-4 text-2xl font-bold text-smoke-900">
                                    Gestión
                                </h3>

                                <p className="leading-7 text-smoke-600">
                                    Coordinamos cada etapa de manera eficiente para
                                    facilitar la experiencia inmobiliaria.
                                </p>
                            </article>

                        </div>
                    </div>
                </section>


                {/* EXPERIENCIA GUP */}
                <section className="bg-smoke-900 text-white">
                    <div className="grid lg:grid-cols-2">

                        {/* Imagen */}
                        <div className="relative min-h-[450px] lg:min-h-[620px]">
                            <img
                                src={gupAbout}
                                alt="Experiencia Gestión Urbana de Propiedades"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/15"></div>
                        </div>


                        {/* Texto */}
                        <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
                            <div className="max-w-xl">

                                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent-200">
                                    Experiencia GUP
                                </p>

                                <h2 className="text-3xl font-bold leading-tight md:text-5xl">
                                    Estamos presentes en cada etapa.
                                </h2>

                                <p className="mt-7 leading-7 text-smoke-300">
                                    Desde la búsqueda de una propiedad hasta su
                                    administración, buscamos que cada interacción sea
                                    sencilla, clara y segura.
                                </p>

                                <p className="mt-5 leading-7 text-smoke-300">
                                    Combinamos tecnología, conocimiento del mercado y
                                    atención personalizada para construir una mejor
                                    experiencia inmobiliaria.
                                </p>

                            </div>
                        </div>

                    </div>
                </section>


                                {/* MISIÓN Y VISIÓN */}
                <section className="px-5 py-20 md:py-28">
                    <div className="mx-auto max-w-[1200px]">

                        <div className="mb-12 max-w-2xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#5980a6]">
                                Nuestro propósito
                            </p>

                            <h2 className="text-3xl font-bold text-[#1d2d3d] md:text-5xl">
                                Miramos más allá de una propiedad.
                            </h2>
                        </div>

                        <div className="grid overflow-hidden rounded-xl shadow-sm md:grid-cols-2">

                            {/* MISIÓN */}
                            <article className="bg-[#1d2d3d] p-10 text-white md:p-14">

                                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#b5d9fd]">
                                    Misión
                                </p>

                                <h3 className="mt-4 text-3xl font-bold leading-tight">
                                    Simplificar la gestión inmobiliaria.
                                </h3>

                                <p className="mt-6 max-w-lg leading-7 text-[#d4d4d7]">
                                    Entregar un servicio confiable y eficiente que facilite
                                    la relación entre propiedades, propietarios y arrendatarios.
                                </p>

                            </article>


                            {/* VISIÓN */}
                            <article className="bg-[#416180] p-10 text-white md:p-14">

                                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#b5d9fd]">
                                    Visión
                                </p>

                                <h3 className="mt-4 text-3xl font-bold leading-tight">
                                    Crear mejores experiencias inmobiliarias.
                                </h3>

                                <p className="mt-6 max-w-lg leading-7 text-[#eef6ff]">
                                    Ser una plataforma reconocida por entregar procesos simples,
                                    transparentes y centrados en las necesidades de las personas.
                                </p>

                            </article>

                        </div>
                    </div>
</section>

            </main>

            <Footer />

        </div>
    );
}

export default AboutUs;