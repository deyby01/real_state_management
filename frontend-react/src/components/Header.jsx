import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
    { label: "Inicio", to: "/" },
    { label: "Propiedades", to: "/propiedades" },
    { label: "Nosotros", to: "/nosotros" },
    { label: "Contacto", to: "/contacto" },
]

const claseOpcion = "block text-center py-3 px-3.75 transition-colors duration-300";

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { usuario, logout } = useAuth();
    const navegar = useNavigate();

    const cerrarSesion = () => {
        setIsOpen(false);
        logout();
        navegar("/");
    };
    return (
        <header className="bg-smoke-900 text-smoke-100 sticky top-0 z-50">
            <nav className="max-w-[1200px] mx-auto px-5 py-2.5 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5">
                    <img className="h-20 md:h-30" src="/logo-gup-nav-sin-fondo.png" alt="logo-gup"/>
                    <span>Gestion Urbana<br />de Propiedades</span>
                </Link>
                <button
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded={isMenuOpen}
                    className="md:hidden p-2.5 text-2xl cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <ul className={`${isMenuOpen ? "flex" : "hidden"} md:flex w-full md:w-auto flex-col md:flex-row md:items-center gap-0 md:gap-7.5 pb-2.5 md:pb-0 text-right md:text-left`}>
                    {navLinks.map((nlink) => (
                        <li key={nlink.label}><Link className="py-2.5 px-3.75 hover:bg-smoke-700 rounded block transition-colors duration-300" to={nlink.to}>{nlink.label}</Link></li>
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
                                {usuario ? (
                                    <>
                                        <li className="text-center text-smoke-700 text-sm py-2 px-3.75">{usuario.nombre}</li>
                                        <li><Link onClick={() => setIsOpen(false)} className={`${claseOpcion} text-ink hover:bg-smoke-500 hover:text-smoke-100`} to="/panel">Mi panel</Link></li>
                                        <li className="bg-smoke-300 h-px my-1.5"></li>
                                        <li><button type="button" onClick={cerrarSesion} className={`${claseOpcion} w-full cursor-pointer text-danger hover:bg-danger hover:text-smoke-100`}>Cerrar Sesión</button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link onClick={() => setIsOpen(false)} className={`${claseOpcion} text-ink hover:bg-smoke-500 hover:text-smoke-100`} to="/login">Iniciar Sesión</Link></li>
                                        <li><Link onClick={() => setIsOpen(false)} className={`${claseOpcion} text-ink hover:bg-smoke-500 hover:text-smoke-100`} to="/registro">Registrarse</Link></li>
                                    </>
                                )}
                            </ul>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    )
}
export default Header;
