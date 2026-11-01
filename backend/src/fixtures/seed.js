// Empties the database and loads the test data from ./data
// Run it with: make seed   (or: npm run seed, without Docker)
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { connectDB } from "../config/db.js"
import TipoPropiedad from "../models/TipoPropiedad.js"
import Usuario from "../models/Usuario.js"
import { tiposPropiedad } from "./data/tiposPropiedad.js"
import { usuarios, PASSWORD_PRUEBA } from "./data/usuarios.js"

const seed = async () => {
    // This script DELETES all data: never run it against production
    if (process.env.NODE_ENV === "production") {
        throw new Error("No se puede ejecutar el seed en produccion")
    }

    await connectDB()

    // 1. Empty the collections, so running the seed twice gives the same result
    await TipoPropiedad.deleteMany({})
    await Usuario.deleteMany({})

    // 2. Property types
    await TipoPropiedad.insertMany(tiposPropiedad)
    console.log(`Tipos de propiedad: ${tiposPropiedad.length}`)

    // 3. Users: hash the test password, the same way register does
    const passwordHash = await bcrypt.hash(PASSWORD_PRUEBA, 10)
    await Usuario.insertMany(usuarios.map((usuario) => ({ ...usuario, passwordHash })))
    console.log(`Usuarios: ${usuarios.length} (contraseña: ${PASSWORD_PRUEBA})`)
}

try {
    await seed()
    console.log("Seed completado")
} catch (error) {
    console.error("Error en el seed:", error.message)
    process.exitCode = 1
} finally {
    // Close the connection, or the script would stay open waiting
    await mongoose.disconnect()
}
