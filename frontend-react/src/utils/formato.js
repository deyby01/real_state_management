/**
 * Display helpers shared by every screen. The API stores raw values (prices as
 * numbers, rule 10; the address as an object); the format is only added on screen.
 */

const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
})

/**
 * @param {number} valor - A price in Chilean pesos, e.g. 1200000.
 * @returns {string} "$1.200.000".
 */
export const formatearPrecio = (valor) => formatoCLP.format(valor ?? 0)

/**
 * @param {{ calle: string, numero?: string, comuna: string, ciudad: string }} direccion
 * @returns {string} "Av. Apoquindo 4800, Las Condes, Santiago".
 */
export const formatearDireccion = (direccion) => {
    if (!direccion) return ""
    const calle = [direccion.calle, direccion.numero].filter(Boolean).join(" ")
    return [calle, direccion.comuna, direccion.ciudad].filter(Boolean).join(", ")
}

/**
 * @param {string} fecha - An ISO date from the API (createdAt, fechaInicio...).
 * @returns {string} "17-11-2026, 15:30".
 */
export const formatearFechaHora = (fecha) =>
    new Date(fecha).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })
