import mongoose from "mongoose"
import Propiedad from "../models/Propiedad.js"
import TipoPropiedad from "../models/TipoPropiedad.js"
import Propietario from "../models/Propietario.js"
import Usuario from "../models/Usuario.js"
import { registrarBitacora } from "../services/bitacora.service.js"

/**
 * Allowed property state transitions: current state → states it can move to.
 * Based on docs/DATA_MODEL.md 6.1, without the transitions owned by rental
 * requests: RESERVADA is reached only by approving a request, and released only
 * by cancelling it (solicitudesArriendo). Anything not listed is rejected with 409.
 */
const TRANSICIONES = {
    DISPONIBLE: ["PUBLICADA", "EN_MANTENCION", "INACTIVA"],
    PUBLICADA: ["DISPONIBLE", "EN_MANTENCION", "INACTIVA"],
    RESERVADA: ["ARRENDADA"],
    ARRENDADA: ["DISPONIBLE", "EN_MANTENCION", "INACTIVA"],
    EN_MANTENCION: ["DISPONIBLE", "INACTIVA"],
    INACTIVA: ["DISPONIBLE"]
}


/**
 * Creates a property for the logged-in executive.
 *
 * Route: POST /api/propiedades (EJECUTIVO only).
 * - Only whitelisted fields are read from the body (prevents mass assignment):
 *   `estado`, `ejecutivoId` and `activo` are always set by the server.
 * - A new property is always DISPONIBLE; `ejecutivoId` comes from the token (RN-15).
 * - The property type must exist and be active (MongoDB does not check references).
 * - The owner (`propietarioId`) must exist and be active, for the same reason.
 * - Logs a CREACION entry after saving (RN-13).
 *
 * Responses: 201 created · 400 invalid data, property type or owner · 401/403 auth ·
 * 500 server error.
 */
export const crearPropiedad = async (req, res) => {
    try {
        const { titulo, tipoId, propietarioId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada } = req.body

        const tipo = await TipoPropiedad.findOne({ _id: tipoId, activo: true })
        if (!tipo) {
            return res.status(400).json({ mensaje: "Tipo de propiedad no válido o inactivo" })
        }

        const propietario = await Propietario.findOne({ _id: propietarioId, activo: true })
        if (!propietario) {
            return res.status(400).json({ mensaje: "Propietario no válido o inactivo" })
        }

        const propiedad = new Propiedad({
            titulo,
            tipoId,
            propietarioId,
            ejecutivoId: req.usuario._id,
            direccion,
            superficie,
            dormitorios,
            banos,
            estacionamientos,
            valorArriendo,
            gastosComunes,
            caracteristicas,
            imagenes,
            destacada
        })

        // Save first, then log: a failed save must not leave a fake audit entry
        await propiedad.save()

        await registrarBitacora({
            entidad: "PROPIEDAD",
            entidadId: propiedad._id,
            accion: "CREACION",
            estadoNuevo: propiedad.estado,
            usuarioId: req.usuario._id
        })

        return res.status(201).json({ mensaje: "Propiedad creada exitosamente", propiedad })

    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ mensaje: "Error de validación al crear la propiedad", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al crear la propiedad", error: error.message })
    }
}


/**
 * Lists the active properties, newest first, for the executives' management view.
 *
 * Route: GET /api/propiedades (EJECUTIVO only).
 * Executives see every property, not only their own, so they can cover for each
 * other. Optional filters: ?estado= and ?ejecutivoId=.
 *
 * Responses: 200 list · 400 invalid ejecutivoId · 401/403 auth · 500 server error.
 */
export const listarPropiedades = async (req, res) => {
    try {
        const { estado, ejecutivoId } = req.query
        const filtro = { activo: true }

        if (estado) filtro.estado = estado
        if (ejecutivoId) filtro.ejecutivoId = ejecutivoId

        const propiedades = await Propiedad.find(filtro)
            .sort({ createdAt: -1 })
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            .populate("propietarioId", "nombre email telefono")

        res.status(200).json(propiedades)

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "Filtro ejecutivoId inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al listar propiedades", error: error.message })
    }
}


/**
 * Returns one active property with its type and executive.
 *
 * Route: GET /api/propiedades/:id (EJECUTIVO only).
 * A soft-deleted property answers 404, as if it did not exist.
 *
 * Responses: 200 property · 400 invalid id · 404 not found · 401/403 auth ·
 * 500 server error.
 */
export const obtenerPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findOne({ _id: req.params.id, activo: true })
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            .populate("propietarioId", "nombre email telefono")

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        res.status(200).json(propiedad)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad invalido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al obtener la propiedad", error: error.message })
    }
}


/**
 * Updates the data of an active property. Fields not sent stay unchanged.
 *
 * Route: PUT /api/propiedades/:id (EJECUTIVO only).
 * - Not editable: `estado` (use PATCH /:id/estado), `ejecutivoId`, `propietarioId`
 *   (changing the owner moves the property to another owner's view) and `activo`.
 * - `direccion` is an embedded object and is replaced as a whole: send it complete.
 * - runValidators: updates skip the schema rules unless it is set.
 * - Not logged in the audit log: editing data is not a state change (RN-13).
 *
 * Responses: 200 updated · 400 invalid data or property type · 404 not found ·
 * 401/403 auth · 500 server error.
 */
export const actualizarPropiedad = async (req, res) => {
    try {
        const { titulo, tipoId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada } = req.body

        if (tipoId) {
            const tipo = await TipoPropiedad.findOne({ _id: tipoId, activo: true })
            if (!tipo) {
                return res.status(400).json({ mensaje: "Tipo de propiedad no válido o inactivo" })
            }
        }

        const propiedad = await Propiedad.findOneAndUpdate(
            { _id: req.params.id, activo: true },
            { titulo, tipoId, direccion, superficie, dormitorios, banos, estacionamientos, valorArriendo, gastosComunes, caracteristicas, imagenes, destacada },
            { returnDocument: "after", runValidators: true }
        )
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")
            .populate("propietarioId", "nombre email telefono")

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        return res.status(200).json({ mensaje: "Propiedad actualizada exitosamente", propiedad })
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ mensaje: "Error de validación al actualizar la propiedad", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al actualizar la propiedad", error: error.message })
    }
}


/**
 * Soft-deletes a property: sets `activo` to false and keeps the record (rule 11).
 *
 * Route: DELETE /api/propiedades/:id (EJECUTIVO only).
 * - A RESERVADA or ARRENDADA property cannot be deleted: an approved request or a
 *   tenant depends on it.
 * - Logs an ELIMINACION entry after saving (RNF-12).
 *
 * Responses: 200 deleted · 400 invalid id · 404 not found or already deleted ·
 * 409 reserved or rented · 401/403 auth · 500 server error.
 */
export const eliminarPropiedad = async (req, res) => {
    try {
        const propiedad = await Propiedad.findOne({ _id: req.params.id, activo: true })

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        if (["RESERVADA", "ARRENDADA"].includes(propiedad.estado)) {
            return res.status(409).json({ mensaje: "No se puede eliminar una propiedad que está reservada o arrendada" })
        }

        propiedad.activo = false
        await propiedad.save()

        await registrarBitacora({
            entidad: "PROPIEDAD",
            entidadId: propiedad._id,
            accion: "ELIMINACION",
            estadoAnterior: propiedad.estado,
            estadoNuevo: propiedad.estado,
            usuarioId: req.usuario._id
        })

        return res.status(200).json({ mensaje: "Propiedad eliminada exitosamente" })
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al eliminar la propiedad", error: error.message })
    }
}


/**
 * Changes the state of a property following the TRANSICIONES table (RN-01, RN-03).
 *
 * Route: PATCH /api/propiedades/:id/estado (EJECUTIVO only).
 * Body: { estado, observacion? }.
 * - RESERVADA can never be set here: it only comes from approving a rental request.
 * - Logs a CAMBIO_ESTADO entry with the previous and the new state (RN-13).
 *
 * Responses: 200 updated · 400 unknown state or invalid id · 404 not found ·
 * 409 transition not allowed · 401/403 auth · 500 server error.
 */
export const cambiarEstadoPropiedad = async (req, res) => {
    try {
        const { estado, observacion } = req.body

        const estadosValidos = Object.keys(TRANSICIONES)
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ mensaje: "Estado no válido", estadosValidos })
        }

        if (estado === "RESERVADA") {
            return res.status(409).json({ mensaje: "Una propiedad solo se reserva aprobando una solicitud de arriendo" })
        }

        const propiedad = await Propiedad.findOne({ _id: req.params.id, activo: true })
        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        // Keep the current state before changing it: the audit log needs both values
        const estadoAnterior = propiedad.estado

        if (!TRANSICIONES[estadoAnterior].includes(estado)) {
            return res.status(409).json({ mensaje: `No se puede pasar de ${estadoAnterior} a ${estado}` })
        }

        propiedad.estado = estado
        await propiedad.save()

        await registrarBitacora({
            entidad: "PROPIEDAD",
            entidadId: propiedad._id,
            accion: "CAMBIO_ESTADO",
            estadoAnterior,
            estadoNuevo: estado,
            usuarioId: req.usuario._id,
            observacion
        })

        return res.status(200).json({ mensaje: "Estado actualizado exitosamente", propiedad })

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al cambiar el estado de la propiedad", error: error.message })
    }
}


/**
 * Fields a visitor may see in the public catalog. An allowlist instead of hiding
 * fields one by one: a sensitive field added to the model later stays private
 * by default. `propietarioId` is never listed (RNF-08, CA-02), and neither are
 * internal fields (`ejecutivoId`, `activo`, `estado`, `updatedAt`).
 */
const CAMPOS_CATALOGO = "titulo tipoId direccion superficie dormitorios banos estacionamientos valorArriendo gastosComunes caracteristicas imagenes destacada createdAt"

/**
 * Lists the public catalog with optional filters (RF5).
 *
 * Route: GET /api/catalogo (public, no token).
 * - Only PUBLICADA and active properties (RN-02): reserved, rented or deleted ones
 *   never appear.
 * - Filters (query string, all optional): `comuna` (exact), `tipo` (property type
 *   _id, from GET /api/tipo-propiedades), `precioMin` / `precioMax` (monthly rent
 *   range), `dormitorios` and `banos` (minimum: "2" means 2 or more).
 * - Never returns the owner's data (RNF-08): see CAMPOS_CATALOGO.
 *
 * Responses: 200 list (newest first) · 400 invalid filter · 500 server error.
 */
export const listarCatalogo = async (req, res) => {
    try {
        const { comuna, tipo, precioMin, precioMax, dormitorios, banos } = req.query

        // RN-02: the base filter is always applied, whatever the visitors sends
        const filtro = { estado: "PUBLICADA", activo: true }

        if (comuna) {
            filtro["direccion.comuna"] = comuna
        }

        if (tipo) {
            if (!mongoose.isValidObjectId(tipo)) {
                return res.status(400).json({ mensaje: "Filtro tipo inválido" })
            }
            filtro.tipoId = tipo
        }

        // Query string values are always text: convert and validate the numeric ones.
        // An empty value (?precioMin=) means "no filter": forms send empty fields
        const numeros = {}
        for (const [nombre, valor] of Object.entries({ precioMin, precioMax, dormitorios, banos })) {
            if (valor === undefined || valor === "") continue
            const numero = Number(valor)
            if (Number.isNaN(numero) || numero < 0) {
                return res.status(400).json({ mensaje: `Filtro ${nombre} inválido: debe ser un número mayor o igual a 0` })
            }
            numeros[nombre] = numero
        }

        if (numeros.precioMin !== undefined && numeros.precioMax !== undefined && numeros.precioMin > numeros.precioMax) {
            return res.status(400).json({ mensaje: "precioMin no puede ser mayor que precioMax" })
        }

        // Price range: build the object once, then add each nound that was sent
        if (numeros.precioMin !== undefined || numeros.precioMax !== undefined) {
            filtro.valorArriendo = {}
            if (numeros.precioMin !== undefined) filtro.valorArriendo.$gte = numeros.precioMin
            if (numeros.precioMax !== undefined) filtro.valorArriendo.$lte = numeros.precioMax
        }

        // Minimums: someone looking for 2 bedrooms is also interested in 3
        if (numeros.dormitorios !== undefined) filtro.dormitorios = { $gte: numeros.dormitorios }
        if (numeros.banos !== undefined) filtro.banos = { $gte: numeros.banos }

        const propiedades = await Propiedad.find(filtro)
            .select(CAMPOS_CATALOGO)
            .sort({ createdAt: -1 })
            .populate("tipoId", "nombre")

        res.status(200).json(propiedades)

    } catch (error) {
        return res.status(500).json({ mensaje: "Error al obtener el catálogo", error: error.message })
    }
}


/**
 * Returns one property of the public catalog.
 *
 * Route: GET /api/catalogo/:id (public, no token).
 * - Same rules as the list: only PUBLICADA and active (RN-02), only CAMPOS_CATALOGO
 *   (RNF-08). A property that exists but is reserved, rented or deleted answers 404,
 *   so a visitor cannot tell it apart from one that never existed.
 *
 * Responses: 200 property · 400 invalid id · 404 not in the catalog · 500 server error.
 */
export const obtenerPropiedadCatalogo = async (req, res) => {
    try {
        const propiedad = await Propiedad.findOne({ _id: req.params.id, estado: "PUBLICADA", activo: true })
            .select(CAMPOS_CATALOGO)
            .populate("tipoId", "nombre")

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        res.status(200).json(propiedad)

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al obtener la propiedad", error: error.message })
    }
}


/**
 * Fields an owner sees about their own properties. An allowlist like
 * CAMPOS_CATALOGO, plus `estado` and `updatedAt` (the owner follows the situation
 * of each property, RNF-07) and `ejecutivoId` (who to contact, problem P3).
 * `propietarioId` (the owner themselves) and `activo` (internal) stay out.
 */
const CAMPOS_PROPIETARIO = `${CAMPOS_CATALOGO} estado ejecutivoId updatedAt`

/**
 * Reads the `propietarios` record linked to the logged-in user.
 * The JWT only carries `_id` and `rol` (rule 19), so `usuarios.propietarioId` is queried here.
 *
 * @param {Object} req - Express request with `req.usuario` set by verificarToken.
 * @returns {Promise<ObjectId|null>} The linked owner id, or null when unlinked.
 */
const propietarioIdDelUsuario = async (req) => {
    const usuario = await Usuario.findById(req.usuario._id).select("propietarioId")
    return usuario?.propietarioId ?? null
}

/**
 * Lists the properties of the logged-in owner (RNF-07, CA-01).
 *
 * Route: GET /api/mis-propiedades (PROPIETARIO only).
 * - The owner comes from the token (`usuarios.propietarioId`), never from the
 *   query or the body (rule 22).
 * - Fails closed with 409 when the account has no linked owner: Mongoose drops
 *   `undefined` keys from a filter, so a missing id could match every property.
 * - Every state is listed (the owner also follows reserved, rented or maintenance
 *   properties); soft-deleted ones are not.
 *
 * Responses: 200 list (newest first) · 401/403 auth · 409 no owner profile · 500 server error.
 */
export const listarMisPropiedades = async (req, res) => {
    try {
        const propietarioId = await propietarioIdDelUsuario(req)
        if (!propietarioId) {
            return res.status(409).json({ mensaje: "Tu cuenta aún no tiene un perfil de propietario asociado" })
        }

        const propiedades = await Propiedad.find({ propietarioId, activo: true })
            .select(CAMPOS_PROPIETARIO)
            .sort({ createdAt: -1 })
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")

        res.status(200).json(propiedades)

    } catch (error) {
        return res.status(500).json({ mensaje: "Error al obtener tus propiedades", error: error.message })
    }
}


/**
 * Returns one property of the logged-in owner.
 *
 * Route: GET /api/mis-propiedades/:id (PROPIETARIO only).
 * - `propietarioId` is part of the filter, so another owner's property answers 404,
 *   the same as a nonexistent one: the owner cannot even confirm it exists (RNF-07).
 *
 * Responses: 200 property · 400 invalid id · 401/403 auth · 404 not found or not theirs ·
 * 409 no owner profile · 500 server error.
 */
export const obtenerMiPropiedad = async (req, res) => {
    try {
        const propietarioId = await propietarioIdDelUsuario(req)
        if (!propietarioId) {
            return res.status(409).json({ mensaje: "Tu cuenta aún no tiene un perfil de propietario asociado" })
        }

        const propiedad = await Propiedad.findOne({ _id: req.params.id, propietarioId, activo: true })
            .select(CAMPOS_PROPIETARIO)
            .populate("tipoId", "nombre")
            .populate("ejecutivoId", "nombre email")

        if (!propiedad) {
            return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        }

        res.status(200).json(propiedad)

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de propiedad inválido", error: error.message })
        }
        return res.status(500).json({ mensaje: "Error al obtener la propiedad", error: error.message })
    }
}
