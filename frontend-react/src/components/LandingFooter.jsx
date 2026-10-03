const footerColumns = [
    {
        title: "Propiedades",
        links: [
            { label: "Departamentos", href: "#" },
            { label: "Casas", href: "#" },
            { label: "Oficinas", href: "#" },
            { label: "Locales comerciales", href: "#" },
        ],
    },
    {
        title: "Propietarios",
        links: [
            { label: "Administración de arriendo", href: "#" },
            { label: "Tasación", href: "#" },
            { label: "Comisiones", href: "#" },
            { label: "Preguntas frecuentes", href: "#" },
        ],
    },
    {
        title: "Empresa",
        links: [
            { label: "Nosotros", href: "#" },
            { label: "Equipo", href: "#" },
            { label: "Trabaja con nosotros", href: "#" },
            { label: "Contacto", href: "#" },
        ],
    }
]

function Footer() {
    return (
        <footer className="bg-smoke-900 text-smoke-100 pt-12.5 px-5 pb-5 mt-6">
            <div className="max-w-[1200px] mx-auto grid gap-10 grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                    <img className="h-27.5" src="/logo-gup-nav-sin-fondo.png" alt="Logo footer" />
                    <p className="text-smoke-500 text-sm leading-relaxed">Gestión Urbana de Propiedades</p>
                </div>

                {footerColumns.map((column) => (
                    <div key={column.title}>
                        <h3 className="font-semibold mb-3.75">{column.title}</h3>
                        <ul>
                            {column.links.map((link) => (
                                <li key={link.label}><a className="block text-smoke-300 text-sm py-1.5 transition-colors duration-300 hover:text-smoke-100" href={link.href}>{link.label}</a></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <p className="max-w-[1200px] mt-10 mx-auto pt-5 border-t border-smoke-100/15 text-smoke-500 text-[13px]">© 2026 GUP Propiedades SpA</p>
        </footer>
    )
}
export default Footer;
