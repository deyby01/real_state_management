// Empties the database and loads the test data from ./data
// Run it with: make seed   (or: npm run seed, without Docker)
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { connectDB } from "../config/db.js"
import TipoPropiedad from "../models/TipoPropiedad.js"
import Usuario from "../models/Usuario.js"
import Cliente from "../models/Cliente.js"
import { clientes } from "./data/clientes.js"
import { tiposPropiedad } from "./data/tiposPropiedad.js"
import { usuarios, PASSWORD_PRUEBA } from "./data/usuarios.js"
import Bitacora from "../models/Bitacora.js"
import Propietario from "../models/Propietario.js"
import { propietarios } from "./data/propietarios.js"
import Propiedad from "../models/Propiedad.js"
import { propiedades } from "./data/propiedades.js"
import Visita from "../models/Visita.js"
import { construirVisitas } from "./data/visitas.js"

/**
 * Builds a lookup table { readable key → _id } from documents already in the database.
 * Fixtures refer to other documents by name, RUT or email because the real _id
 * values only exist after the seed inserts them.
 *
 * @param {Array<Object>} documentos - Documents read from the database.
 * @param {string} campo - Field used as the key (e.g. "nombre", "rut", "email").
 * @returns {Map<string, ObjectId>} Map from the field value to the document _id.
 */
const mapaDeIds = (documentos, campo) =>
    new Map(documentos.map((documento) => [documento[campo], documento._id]))

/**
 * Returns the _id for a readable reference, or stops the seed with a clear message.
 * A typo in a fixture (e.g. "Depto" instead of "Departamento") would otherwise
 * end as a generic "required" validation error that is hard to trace.
 *
 * @param {Map<string, ObjectId>} mapa - Table built with mapaDeIds.
 * @param {string} valor - Readable reference written in the fixture.
 * @param {string} descripcion - What is being looked up, for the error message.
 * @returns {ObjectId} The referenced document _id.
 * @throws {Error} If the reference does not exist.
 */
const buscarId = (mapa, valor, descripcion) => {
    const id = mapa.get(valor)
    if (!id) {
        throw new Error(`Fixture inválido: no existe ${descripcion} "${valor}"`)
    }
    return id
}

const seed = async () => {
    // This script DELETES all data: never run it against production
    if (process.env.NODE_ENV === "production") {
        throw new Error("No se puede ejecutar el seed en produccion")
    }

    await connectDB()

    // 1. Empty the collections, so running the seed twice gives the same result
    await TipoPropiedad.deleteMany({})
    await Usuario.deleteMany({})
    await Cliente.deleteMany({})
    await Bitacora.deleteMany({})
    await Propietario.deleteMany({})
    await Visita.deleteMany({})
    // Properties point to types and owners whose _id changes on every seed:
    // keeping them would leave references to documents that no longer exist
    await Propiedad.deleteMany({})

    // 2. Property types
    await TipoPropiedad.insertMany(tiposPropiedad)
    console.log(`Tipos de propiedad: ${tiposPropiedad.length}`)

    // 3. Users: hash the test password, the same way register does
    const passwordHash = await bcrypt.hash(PASSWORD_PRUEBA, 10)
    await Usuario.insertMany(usuarios.map((usuario) => ({ ...usuario, passwordHash })))
    console.log(`Usuarios: ${usuarios.length} (contraseña: ${PASSWORD_PRUEBA})`)

    // 4. Clients
    await Cliente.insertMany(clientes)
    console.log(`Clientes: ${clientes.length}`)

    // 5. Owners
    await Propietario.insertMany(propietarios)
    console.log(`Propietarios: ${propietarios.length}`)

    // 6. Properties: inserted last because they point to types, owners and executives.
    // The readable references of the fixture are translated into the new _id values
    const tiposPorNombre = mapaDeIds(await TipoPropiedad.find(), "nombre")
    const propietariosPorRut = mapaDeIds(await Propietario.find(), "rut")
    const ejecutivosPorEmail = mapaDeIds(await Usuario.find({ rol: "EJECUTIVO" }), "email")

    await Propiedad.insertMany(
        propiedades.map(({ tipo, propietarioRut, ejecutivoEmail, ...datos }) => ({
            ...datos,
            tipoId: buscarId(tiposPorNombre, tipo, "el tipo"),
            propietarioId: buscarId(propietariosPorRut, propietarioRut, "el propietario con RUT"),
            ejecutivoId: buscarId(ejecutivosPorEmail, ejecutivoEmail, "el ejecutivo"),
        }))
    )
    console.log(`Propiedades: ${propiedades.length}`)

    // 7. Link the PROPIETARIO login account to its owner record (usuarios.propietarioId),
    // so "my properties" can filter by the logged-in owner (RNF-07)
    await Usuario.updateOne(
        { email: "propietario@gup.cl" },
        { propietarioId: buscarId(propietariosPorRut, "12345678-5", "el propietario con RUT") }
    )
    console.log("Cuenta propietario@gup.cl vinculada a su propietario")

    // 8. Link the CLIENTE login account to its client record (usuarios.clienteId).
    // Rental requests take the client from the token through this link (rule 17),
    // so without it the test client could not create a request after the seed
    const clientesPorEmail = mapaDeIds(await Cliente.find(), "email")
    await Usuario.updateOne(
        { email: "cliente@gup.cl" },
        { clienteId: buscarId(clientesPorEmail, "cliente@gup.cl", "el cliente con email") }
    )
    console.log("Cuenta cliente@gup.cl vinculada a su cliente")

    // 9. Visits: built from PUBLICADA properties loaded in step 6 (see data/visitas.js)
    const idsEjecutivos = new Set(
        (await Usuario.find({ rol: "EJECUTIVO" })).map((usuario) => usuario._id.toString())
    )

    const propiedadesParaVisitas = (
        await Propiedad.find({ estado: "PUBLICADA", activo: true }).sort({ titulo: 1 })
    )
        .filter((propiedad) => idsEjecutivos.has(propiedad.ejecutivoId.toString()))
        .slice(0, 2)

    if (propiedadesParaVisitas.length === 2) {
        const ahora = new Date()
        const visitas = construirVisitas(propiedadesParaVisitas).map((v) => ({
            ...v,
            createdAt: ahora,
            updatedAt: ahora
        }))
        // Mongoose 9+: insertMany validates and casts by default; lean: true skips both.
        // The fixture supplies ObjectIds, Dates and timestamps (REALIZADA in the past).
        await Visita.insertMany(visitas, { lean: true })
        console.log(`Visitas: ${visitas.length}`)
    } else {
        console.log("Visitas: omitidas (faltan 2 propiedades PUBLICADA con ejecutivo vigente)")
    }
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
