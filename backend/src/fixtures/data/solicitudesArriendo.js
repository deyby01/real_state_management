export default function buildSolicitudesArriendo({ propiedades, clientes }) {
    const p = (i) => propiedades[i % propiedades.length]
    const c = (i) => clientes[i % clientes.length]

    return [
        { propiedadId: p(0)._id, clienteId: c(0)._id, ejecutivoId: p(0).ejecutivoId,
            antecedentes: { ingresosMensuales: 1200000, ocupacion: "Ingeniero", numeroOcupantes: 2, tieneMascotas: false },
            estado: "PENDIENTE" },
        { propiedadId: p(1)._id, clienteId: c(1)._id, ejecutivoId: p(1).ejecutivoId,
            antecedentes: { ingresosMensuales: 900000, ocupacion: "Profesora", numeroOcupantes: 3, tieneMascotas: true },
            estado: "EN_EVALUACION",
            observaciones: [{ texto: "Revisando liquidaciones de sueldo", usuarioId: p(1).ejecutivoId }] },
        { propiedadId: p(2)._id, clienteId: c(0)._id, ejecutivoId: p(2).ejecutivoId,
            antecedentes: { ingresosMensuales: 600000, ocupacion: "Independiente", numeroOcupantes: 1 },
            estado: "RECHAZADA",
            observaciones: [{ texto: "Ingresos insuficientes", usuarioId: p(2).ejecutivoId }] },
        { propiedadId: p(3)._id, clienteId: c(1)._id, ejecutivoId: p(3).ejecutivoId,
            antecedentes: { ingresosMensuales: 1500000, ocupacion: "Médico", numeroOcupantes: 2 },
            estado: "CANCELADA" },
    ]
}