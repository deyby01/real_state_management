function AboutUs() {
  return (
    <main>

      {/* HERO */}
      <section className="bg-white px-5 py-24 text-[#1d2d3d] md:py-32">
        <div className="mx-auto max-w-[1200px]">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#5980a6]">
            Gestión Urbana de Propiedades
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl text-[#1d2d3d]">
            Más que propiedades,
            <br />
            construimos confianza.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[#5d5d60] md:text-lg">
            Acompañamos a propietarios y arrendatarios durante todo el
            proceso inmobiliario, entregando una gestión cercana,
            transparente y eficiente.
          </p>

        </div>
      </section>


      {/* QUIÉNES SOMOS */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-[1200px] gap-12 md:grid-cols-2 md:gap-20">

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#5980a6]">
              Nosotros
            </p>

            <h2 className="text-3xl font-bold leading-tight text-[#1d2d3d] md:text-4xl">
              Una gestión inmobiliaria simple, cercana y transparente.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-7 text-[#5d5d60]">
            <p>
              En Gestión Urbana de Propiedades trabajamos para simplificar
              la administración y búsqueda de propiedades, conectando a
              personas con espacios que respondan a sus necesidades.
            </p>

            <p>
              Nuestro objetivo es entregar información clara y acompañamiento
              durante cada etapa del proceso, generando relaciones basadas
              en la confianza y la transparencia.
            </p>
          </div>

        </div>
      </section>


      {/* VALORES */}
      <section className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-[1200px]">

          <div className="mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#5980a6]">
              Nuestra forma de trabajar
            </p>

            <h2 className="text-3xl font-bold text-[#1d2d3d] md:text-4xl">
              Lo que nos representa
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">

            <article className="border-t-2 border-[#5980a6] pt-6">
              <span className="text-sm font-bold text-[#5980a6]">
                °1
              </span>

              <h3 className="my-3 text-xl font-bold text-[#1d2d3d]">
                Cercanía
              </h3>

              <p className="leading-7 text-[#5d5d60]">
                Escuchamos las necesidades de cada persona para entregar
                una atención clara y personalizada.
              </p>
            </article>


            <article className="border-t-2 border-[#5980a6] pt-6">
              <span className="text-sm font-bold text-[#5980a6]">
                °2
              </span>

              <h3 className="my-3 text-xl font-bold text-[#1d2d3d]">
                Transparencia
              </h3>

              <p className="leading-7 text-[#5d5d60]">
                Entregamos información comprensible y mantenemos una
                comunicación directa durante todo el proceso.
              </p>
            </article>


            <article className="border-t-2 border-[#5980a6] pt-6">
              <span className="text-sm font-bold text-[#5980a6]">
                °3
              </span>

              <h3 className="my-3 text-xl font-bold text-[#1d2d3d]">
                Gestión
              </h3>

              <p className="leading-7 text-[#5d5d60]">
                Organizamos cada etapa de manera eficiente para facilitar
                la experiencia de propietarios y arrendatarios.
              </p>
            </article>

          </div>
        </div>
      </section>


      {/* MISIÓN Y VISIÓN */}
      <section className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-xl md:grid-cols-2">

          <article className="bg-[#1d2d3d] p-10 text-white md:p-14">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#b5d9fd]">
              Misión
            </p>

            <h2 className="mb-5 text-3xl font-bold">
              Simplificar la gestión inmobiliaria.
            </h2>

            <p className="leading-7 text-[#d4d4d7]">
              Entregar un servicio confiable y eficiente que facilite
              la relación entre propiedades, propietarios y arrendatarios.
            </p>
          </article>


          <article className="bg-[#416180] p-10 text-white md:p-14">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#b5d9fd]">
              Visión
            </p>

            <h2 className="mb-5 text-3xl font-bold">
              Crear mejores experiencias inmobiliarias.
            </h2>

            <p className="leading-7 text-[#eef6ff]">
              Ser una plataforma reconocida por entregar procesos simples,
              transparentes y centrados en las necesidades de las personas.
            </p>
          </article>

        </div>
      </section>

    </main>
  );
}

export default AboutUs;