const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Propiedades", href: "#" },
    { label: "Nosotros", href: "#" },
    { label: "Contacto", href: "#" },
]

function Header() {
    return (
        <header className="bg-brand-900 text-smoke-100 sticky top-0">
            <nav className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
                <a href="#" className="flex items-center gap-2.5">
                    <img className="h-30" src="/logo-gup-nav-sin-fondo.png" alt="logo-gup"/>
                    <span>Gestion Urbana<br />de Propiedades</span>
                </a>
                <ul className="flex gap-7.5 items-center">
                    {navLinks.map((nlink) => (
                        <li key={nlink.label}><a className="py-2.5 px-3.75 hover:bg-brand-700 rounded block transition-colors duration-300" href={nlink.href}>{nlink.label}</a></li>
                    ))}
                    <li>
                        <button className="py-2.5 px-3.75 hover:bg-brand-700 rounded transition-colors duration-300 text-[25px] cursor-pointer">
                            <i className="fa-regular fa-user"></i>
                        </button>
                        <ul>
                            <li><a href="#">Iniciar Sesión</a></li>
                            <li><a href="#">Registrarse</a></li>
                            <li><a href="#">Cerrar Sesión</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
export default Header;
