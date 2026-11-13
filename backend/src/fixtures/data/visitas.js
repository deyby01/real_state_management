import { DURACION_VISITA_MS } from "../../models/Visita.js"

// Sample visits for the seed (collection `visitas`).
// Built from the PUBLICADA properties and the clients inserted by the seed, so it
// does not depend on fixed ids. Dates are relative to now, so the demo always has
// upcoming visits.

const HORA_MS = 60 * 60 * 1000
const enHoras = (horas) => new Date(Date.now() + horas * HORA_MS)

/**
 * Builds sample visits from the properties and clients loaded by the seed.
 *
 * @param {Array<Document>} propiedades - At least two PUBLICADA properties.
 * @param {Array<Document>} clientes - At least two clients, ordered by email.
 * @returns {Array<Object>} Plain objects ready for `Visita.insertMany`.
 */
export const construirVisitas = (propiedades, clientes) => {
    const [primera, segunda] = propiedades
    const [cliente1, cliente2] = clientes

    const crear = (propiedad, horas, estado, extra = {}) => {
        const fechaInicio = enHoras(horas)
        return {
            propiedadId: propiedad._id,
            clienteId: extra.clienteId || cliente1._id,
            // D10: the visit keeps the executive assigned to the property
            ejecutivoId: propiedad.ejecutivoId,
            fechaInicio,
            fechaFin: new Date(fechaInicio.getTime() + DURACION_VISITA_MS),
            estado,
            observaciones: extra.observaciones,
            resultado: extra.resultado
        }
    }

    return [
        crear(primera, 72, "SOLICITADA", { observaciones: "Quiere ver el departamento con su pareja" }),
        crear(primera, 96, "CONFIRMADA", { observaciones: "Confirmada por teléfono" }),
        crear(primera, -168, "REALIZADA", { resultado: "Interesado en presentar una solicitud" }),
        crear(segunda, 120, "RECHAZADA", { observaciones: "El horario no le acomodaba" }),
        crear(segunda, 144, "CANCELADA", { observaciones: "El cliente canceló" }),
        crear(segunda, 168, "SOLICITADA", { clienteId: cliente2._id })
    ]
}
