import mongoose from "mongoose"
import { DURACION_VISITA_MS } from "../../models/Visita.js"

// Sample visits for the seed (collection `visitas`).
// Built from PUBLICADA properties present when the seed runs, so it does not
// depend on fixed ids or on the properties fixture (Deyby, pending).
// Dates are relative to now, so the demo always has upcoming visits.

// `clientes` is not merged (Jose): placeholder ObjectIds, never populated.
// Must be ObjectId instances: seed insert uses `lean: true`, which skips Mongoose casting.
const CLIENTE_1 = new mongoose.Types.ObjectId("650000000000000000000002")
const CLIENTE_2 = new mongoose.Types.ObjectId("650000000000000000000003")

const HORA_MS = 60 * 60 * 1000
const enHoras = (horas) => new Date(Date.now() + horas * HORA_MS)

/**
 * Builds sample visits from properties loaded by the seed.
 *
 * @param {Array<{ _id: import("mongoose").Types.ObjectId, ejecutivoId: import("mongoose").Types.ObjectId }>} propiedades - At least two PUBLICADA properties.
 * @returns {Array<Object>} Plain objects ready for `Visita.insertMany`.
 */
export const construirVisitas = (propiedades) => {
    const [primera, segunda] = propiedades

    const crear = (propiedad, horas, estado, extra = {}) => {
        const fechaInicio = enHoras(horas)
        return {
            propiedadId: propiedad._id,
            clienteId: extra.clienteId || CLIENTE_1,
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
        crear(segunda, 168, "SOLICITADA", { clienteId: CLIENTE_2 })
    ]
}