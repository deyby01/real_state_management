// Sample visits for the seed (collection `visitas`): one per state, plus a second
// SOLICITADA. References are readable, like the other fixtures: `seed.js` translates
// `propiedadTitulo` and `clienteEmail` into _id values, and copies the executive from
// the property (D10).
//
// `horas` is relative to the moment the seed runs, so the demo always has upcoming
// visits; negative values are visits that already happened.

const HORA_MS = 60 * 60 * 1000

/**
 * Returns the date `horas` away from now (negative values are in the past).
 * Kept in the fixture so every sample visit is expressed as an offset.
 *
 * @param {number} horas - Offset in hours.
 * @returns {Date}
 */
export const enHoras = (horas) => new Date(Date.now() + horas * HORA_MS)

export const visitas = [
    // ejecutivo1 (Departamento luminoso): 72 h and 96 h are 24 h apart, so they never
    // overlap each other (RN-10). The REALIZADA one is in the past on purpose.
    {
        estado: "SOLICITADA",
        propiedadTitulo: "Departamento luminoso cerca del metro",
        clienteEmail: "cliente@gup.cl",
        horas: 72,
        observaciones: "Quiere ver el departamento con su pareja",
    },
    {
        estado: "CONFIRMADA",
        propiedadTitulo: "Departamento luminoso cerca del metro",
        clienteEmail: "cliente@gup.cl",
        horas: 96,
        observaciones: "Confirmada por teléfono",
    },
    {
        estado: "REALIZADA",
        propiedadTitulo: "Departamento luminoso cerca del metro",
        clienteEmail: "cliente@gup.cl",
        horas: -168,
        resultado: "Interesado en presentar una solicitud",
    },

    // ejecutivo2 (Estudio amoblado): 120 h and 144 h, also 24 h apart
    {
        estado: "RECHAZADA",
        propiedadTitulo: "Estudio amoblado en Providencia",
        clienteEmail: "luis.soto@mail.cl",
        horas: 120,
        observaciones: "El horario no le acomodaba",
    },
    {
        estado: "CANCELADA",
        propiedadTitulo: "Estudio amoblado en Providencia",
        clienteEmail: "luis.soto@mail.cl",
        horas: 144,
        observaciones: "El cliente canceló",
    },

    // ejecutivo1 again (Departamento con vista al mar): 168 h, far from its other visits
    {
        estado: "SOLICITADA",
        propiedadTitulo: "Departamento con vista al mar",
        clienteEmail: "luis.soto@mail.cl",
        horas: 168,
    },
]
