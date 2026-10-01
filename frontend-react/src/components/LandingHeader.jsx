import { useState } from "react";

const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Propiedades", href: "#" },
    { label: "Nosotros", href: "#" },
    { label: "Contacto", href: "#" },
]

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="bg-smoke-900 text-smoke-100 sticky top-0">
            <nav className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                <a href="#" className="flex items-center gap-2.5">
                    <img className="h-30" src="/logo-gup-nav-sin-fondo.png" alt="logo-gup"/>
                    <span>Gestion Urbana<br />de Propiedades</span>
                </a>
                <ul className="flex gap-7.5 items-center">
                    {navLinks.map((nlink) => (
                        <li key={nlink.label}><a className="py-2.5 px-3.75 hover:bg-smoke-700 rounded block transition-colors duration-300" href={nlink.href}>{nlink.label}</a></li>
                    ))}
                    <li className="relative">
                        <button
                            type="button"
                            aria-label="Menú de usuario"
                            className="py-2.5 px-3.75 hover:bg-smoke-700 rounded transition-colors duration-300 text-[25px] cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}>
                            <i className="fa-regular fa-user"></i>
                        </button>
                        {isOpen && (
                            <ul className="absolute top-full mt-2 right-0 bg-smoke-100 border border-smoke-300 rounded-lg min-w-45 overflow-hidden py-1.5 shadow-lg">
                                <li><a className="block text-center text-ink py-3 px-3.75 transition-colors duration-300 hover:bg-smoke-500 hover:text-smoke-100" href="#">Iniciar Sesión</a></li>
                                <li><a className="block text-center text-ink py-3 px-3.75 transition-colors duration-300 hover:bg-smoke-500 hover:text-smoke-100" href="#">Registrarse</a></li>
                                <li className="bg-smoke-300 h-px my-1.5"></li>
                                <li><a className="text-danger hover:bg-danger hover:text-smoke-100 text-center block transition-colors duration-300 py-3 px-3.75" href="#">Cerrar Sesión</a></li>
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    )
}
export default Header;
