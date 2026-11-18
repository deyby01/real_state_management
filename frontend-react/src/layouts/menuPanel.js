/**
 * Sidebar links of the panel, by role. PanelLayout shows only the links of the
 * logged-in user's role. Who sees what comes from the use-case matrix of the case
 * specification (CU2, CU3, CU5... belong to the executive), the same as the
 * backend's permitirRoles: keep both in sync.
 *
 * Each section's owner fills in its page and adds its <Route> in App.jsx.
 * Until then, the link opens the "en construcción" page.
 */
/**
 * Readable name and short description of each role, shown in the header menu
 * and the profile page. The roles and what they do come from the use-case matrix.
 */
export const ROLES = {
    ADMIN: { texto: "Administrador", descripcion: "Supervisa el sistema y revisa la bitácora de cambios." },
    EJECUTIVO: { texto: "Ejecutivo", descripcion: "Gestiona propiedades, propietarios, clientes, visitas y solicitudes de arriendo." },
    PROPIETARIO: { texto: "Propietario", descripcion: "Consulta el estado de sus propiedades y quién las administra." },
    CLIENTE: { texto: "Cliente", descripcion: "Busca propiedades, solicita arriendos y agenda visitas." },
}

/**
 * Initials for the avatar: "Carla Rojas" → "CR", "Admin GUP" → "AG".
 *
 * @param {string} nombre
 * @returns {string}
 */
export const iniciales = (nombre = "") =>
    nombre.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0].toUpperCase()).join("")

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
