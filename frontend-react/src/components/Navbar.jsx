import { useState } from "react";
import logo from "../assets/logo-gup-nav-sin-fondo.png";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#1d2d3d]">
      <nav className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between px-5">

        {/* Marca */}
        <a href="/" className="flex items-center gap-3 text-[#f5f5f8]">
          <img
            src={logo}
            alt="Logo GUP"
            className="h-20 w-auto md:h-[110px]"
          />

          <span className="hidden text-sm leading-tight sm:block">
            Gestión Urbana
            <br />
            de Propiedades
          </span>
        </a>

        {/* Botón móvil */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md px-3 py-2 text-2xl text-white transition hover:bg-[#416180] md:hidden"
          aria-label="Abrir menú"
        >
          ☰
        </button>

        {/* Navegación */}
        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } w-full flex-col items-end gap-1 pb-4 md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:pb-0`}
        >
          <a
            href="/"
            className="rounded-md px-4 py-2.5 text-[#f5f5f8] transition hover:bg-[#416180]"
          >
            Inicio
          </a>

          <a
            href="/properties"
            className="rounded-md px-4 py-2.5 text-[#f5f5f8] transition hover:bg-[#416180]"
          >
            Propiedades
          </a>

          <a
            href="/about-us"
            className="rounded-md bg-[#416180] px-4 py-2.5 text-[#f5f5f8]"
          >
            Nosotros
          </a>

          <a
            href="/contact"
            className="rounded-md px-4 py-2.5 text-[#f5f5f8] transition hover:bg-[#416180]"
          >
            Contacto
          </a>

          <button
            className="rounded-md px-4 py-2.5 text-xl text-white transition hover:bg-[#416180]"
            aria-label="Usuario"
          >
            ♙
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;