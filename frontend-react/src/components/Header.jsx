import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, iniciales } from "../layouts/menuPanel";

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
                            aria-expanded={isOpen}
                            className="py-2.5 px-3.75 hover:bg-smoke-700 rounded transition-colors duration-300 cursor-pointer inline-flex items-center gap-2"
                            onClick={() => setIsOpen(!isOpen)}>
                            {/* With a session the icon becomes the user's initials and name,
                                so it is obvious that someone is logged in */}
                            {usuario ? (
                                <>
                                    <span className="w-9 h-9 rounded-full bg-smoke-100 text-smoke-900 text-sm font-bold flex items-center justify-center">
                                        {iniciales(usuario.nombre)}
                                    </span>
                                    <span className="text-sm">{usuario.nombre.split(" ")[0]}</span>
                                    <i className="fa-solid fa-chevron-down text-xs"></i>
                                </>
                            ) : (
                                <i className="fa-regular fa-user text-[25px]"></i>
                            )}
                        </button>
                        {isOpen && (
                            <ul className="absolute top-full mt-2 right-0 bg-smoke-100 border border-smoke-300 rounded-lg min-w-60 overflow-hidden py-1.5 shadow-lg">
                                {usuario ? (
                                    <>
                                        <li className="px-4 py-2.5 text-left">
                                            <p className="text-ink font-semibold">{usuario.nombre}</p>
                                            <p className="text-smoke-700 text-xs">{usuario.email}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-smoke-900 text-smoke-100 text-xs">
                                                {ROLES[usuario.rol]?.texto ?? usuario.rol}
                                            </span>
                                        </li>
                                        <li className="bg-smoke-300 h-px my-1.5"></li>
                                        <li><Link onClick={() => setIsOpen(false)} className={`${claseOpcion} text-ink hover:bg-smoke-500 hover:text-smoke-100`} to="/panel"><i className="fa-solid fa-gauge mr-2"></i>Mi panel</Link></li>
                                        <li><Link onClick={() => setIsOpen(false)} className={`${claseOpcion} text-ink hover:bg-smoke-500 hover:text-smoke-100`} to="/panel/perfil"><i className="fa-solid fa-id-card mr-2"></i>Mi perfil</Link></li>
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
