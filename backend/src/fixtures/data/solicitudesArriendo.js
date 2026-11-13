// Test rental requests, one per state so the rental flow, the reservation and the
// cancel rules can be tested right after `make seed`.
//
// References are written in a readable way, because the real _id values do not
// exist until the seed inserts the properties and clients. seed.js translates them:
//   propiedadTitulo → propiedadId (Propiedad.titulo)
//   clienteEmail    → clienteId   (Cliente.email)
//
// `ejecutivoId` is not written here: the seed copies it from the property (D10),
// exactly like the create controller does.
//
// "Departamento con vista al mar" is left without a request on purpose, so a new
// request can be created from scratch in Postman.
export const solicitudesArriendo = [
    {
        // The test client sees their own request and can cancel it (PENDIENTE only)
        propiedadTitulo: "Departamento luminoso cerca del metro",
        clienteEmail: "cliente@gup.cl",
        antecedentes: { ingresosMensuales: 1200000, ocupacion: "Ingeniero", numeroOcupantes: 2, tieneMascotas: false },
        estado: "PENDIENTE",
    },
    {
        // The assigned executive can approve or reject it
        propiedadTitulo: "Casa familiar con patio",
        clienteEmail: "luis.soto@mail.cl",
        antecedentes: { ingresosMensuales: 900000, ocupacion: "Profesora", numeroOcupantes: 3, tieneMascotas: true },
        estado: "EN_EVALUACION",
        observaciones: [{ texto: "Revisando liquidaciones de sueldo" }],
    },
    {
        // Client history with a final state
        propiedadTitulo: "Estudio amoblado en Providencia",
        clienteEmail: "cliente@gup.cl",
        antecedentes: { ingresosMensuales: 600000, ocupacion: "Independiente", numeroOcupantes: 1 },
        estado: "RECHAZADA",
        observaciones: [{ texto: "Ingresos insuficientes" }],
    },
    {
        // Final state
        propiedadTitulo: "Oficina habilitada en Las Condes",
        clienteEmail: "luis.soto@mail.cl",
        antecedentes: { ingresosMensuales: 1500000, ocupacion: "Médico", numeroOcupantes: 2 },
        estado: "CANCELADA",
    },
    {
        // This property is RESERVADA in the fixtures: the approved request explains
        // the reservation (RN-04), and cancelling it releases the property (CU9)
        propiedadTitulo: "Departamento reservado en Ñuñoa",
        clienteEmail: "luis.soto@mail.cl",
        antecedentes: { ingresosMensuales: 1100000, ocupacion: "Contadora", numeroOcupantes: 2, tieneMascotas: false },
        estado: "APROBADA",
    },
]
