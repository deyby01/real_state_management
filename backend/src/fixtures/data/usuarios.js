// Test users, one per role (two executives to test reassignment and overlapping visits).
// The passwords are written in plain text here ONLY because they are fake test data:
// seed.js hashes them with bcryptjs before saving. Never put real passwords in this file.
export const PASSWORD_PRUEBA = "Password123"

export const usuarios = [
    { nombre: "Admin GUP", email: "admin@gup.cl", rol: "ADMIN" },
    { nombre: "Carla Rojas", email: "ejecutivo1@gup.cl", rol: "EJECUTIVO" },
    { nombre: "Matías Soto", email: "ejecutivo2@gup.cl", rol: "EJECUTIVO" },
    { nombre: "Jorge Muñoz", email: "propietario@gup.cl", rol: "PROPIETARIO" },
    { nombre: "Ana Pérez", email: "cliente@gup.cl", rol: "CLIENTE" },
]
