// Clients (RF6): one with a login account, the others registered by the executive.
// The RUT keeps its hyphen because that is the format the controller stores (12345678-9).
export const clientes = [
    {
        rut: "12345678-9",
        nombre: "Ana Pérez",
        email: "cliente@gup.cl",
        telefono: "+56911111111",
        ciudad: "Santiago",
        comuna: "Ñuñoa",
        estado: "INTERESADO",
    },
    {
        rut: "9876543-2",
        nombre: "Luis Soto",
        email: "luis.soto@mail.cl",
        telefono: "+56922222222",
        ciudad: "Santiago",
        comuna: "Maipú",
        estado: "INTERESADO",
    },
    {
        rut: "15234567-8",
        nombre: "Camila Rivas",
        email: "camila.rivas@mail.cl",
        telefono: "+56933333333",
        ciudad: "Viña del Mar",
        comuna: "Viña del Mar",
        estado: "ARRENDATARIO",
    },
]