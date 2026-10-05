import logo from "../assets/logo-gup-nav-sin-fondo.png";

function Footer() {
  return (
    <footer className="bg-[#1d2d3d] px-5 pb-5 pt-12 text-[#f5f5f8]">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">

        <div>
          <img
            src={logo}
            alt="Logo GUP"
            className="h-24 w-auto"
          />

          <p className="max-w-sm text-sm leading-6 text-[#d4d4d7]">
            Gestión Urbana de Propiedades. Corretaje y administración
            de arriendos.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Propiedades</h3>

          <ul className="space-y-2 text-sm text-[#d4d4d7]">
            <li>Departamentos</li>
            <li>Casas</li>
            <li>Oficinas</li>
            <li>Locales comerciales</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Propietarios</h3>

          <ul className="space-y-2 text-sm text-[#d4d4d7]">
            <li>Administración de arriendo</li>
            <li>Tasación</li>
            <li>Comisiones</li>
            <li>Preguntas frecuentes</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">Empresa</h3>

          <ul className="space-y-2 text-sm text-[#d4d4d7]">
            <li>Nosotros</li>
            <li>Equipo</li>
            <li>Trabaja con nosotros</li>
            <li>Contacto</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1200px] border-t border-white/15 pt-5">
        <p className="text-sm text-[#98989b]">
          © 2026 GUP Propiedades SpA
        </p>
      </div>
    </footer>
  );
}

export default Footer;