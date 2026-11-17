/**
 * Sidebar links of the panel, by role. PanelLayout shows only the links of the
 * logged-in user's role. Who sees what comes from the use-case matrix of the case
 * specification (CU2, CU3, CU5... belong to the executive), the same as the
 * backend's permitirRoles: keep both in sync.
 *
 * Each section's owner fills in its page and adds its <Route> in App.jsx.
 * Until then, the link opens the "en construcción" page.
 */
export const MENU_POR_ROL = {
    ADMIN: [
        { ruta: "/panel/bitacora", texto: "Bitácora", icono: "fa-solid fa-clock-rotate-left" },
    ],
    EJECUTIVO: [
        { ruta: "/panel/propiedades", texto: "Propiedades", icono: "fa-solid fa-building" },
        { ruta: "/panel/propietarios", texto: "Propietarios", icono: "fa-solid fa-user-tie" },
        { ruta: "/panel/clientes", texto: "Clientes", icono: "fa-solid fa-users" },
        { ruta: "/panel/visitas", texto: "Visitas", icono: "fa-solid fa-calendar-days" },
        { ruta: "/panel/solicitudes", texto: "Solicitudes", icono: "fa-solid fa-file-signature" },
    ],
    PROPIETARIO: [
        { ruta: "/panel/mis-propiedades", texto: "Mis propiedades", icono: "fa-solid fa-house" },
    ],
    CLIENTE: [
        { ruta: "/panel/mis-solicitudes", texto: "Mis solicitudes", icono: "fa-solid fa-file-signature" },
    ],
}
