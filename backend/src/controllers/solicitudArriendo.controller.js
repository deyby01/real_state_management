/**
 * Rental request flow: create a request, evaluate it and reserve the property.
 * Controllers only; routes and role protection live in solicitudArriendo.routes.js.
 */
import mongoose from "mongoose"
import SolicitudArriendo from "../models/SolicitudArriendo.js"
import Usuario from "../models/Usuario.js"
import Propiedad from "../models/Propiedad.js"
import Cliente from "../models/Cliente.js"
import { registrarBitacora } from "../services/bitacora.service.js"

/** Maps driver/schema errors to the API status codes used by this model. */
const manejarError = (res, error) => {
    if (error.code === 11000)
        return res.status(409).json({ mensaje: "Ya existe una solicitud aprobada para esta propiedad" })
    if (error.name === "CastError") return res.status(400).json({ mensaje: "ID inválido" })
    if (error.name === "ValidationError")
        return res.status(400).json({ mensaje: "Datos inválidos", error: error.message })
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message })
}

/** Compares two ObjectIds by their string form, treating null/undefined as different. */
const igual = (a, b) => Boolean(a && b) && String(a) === String(b)

/**
 * Reads the `clientes` record linked to the logged-in user.
 * The JWT only carries `_id` and `rol`, so `usuarios.clienteId` is queried here.
 *
 * @param {Object} req - Express request with `req.usuario` set by verificarToken.
 * @returns {Promise<ObjectId|null>} The linked client id, or null when unlinked.
 */
const clienteIdDelUsuario = async (req) => {
    const usuario = await Usuario.findById(req.usuario._id).select("clienteId")
    return usuario?.clienteId ?? null
}

/** Ownership check: a client sees their own request; an executive sees assigned ones. */
const puedeVer = async (req, solicitud) => {
    const { rol, _id } = req.usuario
    if (rol === "EJECUTIVO") return igual(solicitud.ejecutivoId, _id)
    if (rol === "CLIENTE") return igual(solicitud.clienteId, await clienteIdDelUsuario(req))
    return false
}

/** Inserts an audit entry for a rental request state change (RN-13). */
const bitacoraSolicitud = (req, solicitud, accion, estadoAnterior, estadoNuevo, observacion) =>
    registrarBitacora({
        entidad: "SOLICITUD",
        entidadId: solicitud._id,
        accion,
        estadoAnterior,
        estadoNuevo,
        usuarioId: req.usuario._id,
        observacion,
    })

/** Inserts an audit entry for the property state changed by this flow (RN-13). */
const bitacoraPropiedad = (req, propiedad, accion, estadoAnterior, estadoNuevo, observacion) =>
    registrarBitacora({
        entidad: "PROPIEDAD",
        entidadId: propiedad._id,
        accion,
        estadoAnterior,
        estadoNuevo,
        usuarioId: req.usuario._id,
        observacion,
    })

/**
 * Lists the rental requests visible to the logged-in user.
 *
 * Route: GET /api/solicitudes (CLIENTE or EJECUTIVO).
 * - CLIENTE sees only their own requests (client id from the token, rule 17).
 * - EJECUTIVO sees only requests assigned to them (D10).
 *
 * Responses: 200 newest first · 401/403 auth · 500 server error.
 */
export const listarSolicitudes = async (req, res) => {
    try {
        const { rol, _id } = req.usuario
        let filtro = {}
        if (rol === "CLIENTE") filtro = { clienteId: await clienteIdDelUsuario(req) }
        else if (rol === "EJECUTIVO") filtro = { ejecutivoId: _id }
        else return res.status(403).json({ mensaje: "Sin permisos" })

        const solicitudes = await SolicitudArriendo.find(filtro).sort({ createdAt: -1 })
        res.status(200).json(solicitudes)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Returns one rental request when the logged-in user is allowed to see it.
 *
 * Route: GET /api/solicitudes/:id (CLIENTE or EJECUTIVO).
 * - CLIENTE: only their own request; EJECUTIVO: only the assigned one.
 *
 * Responses: 200 · 400 invalid id · 404 not found or not yours · 500 server error.
 */
export const obtenerSolicitud = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: "ID inválido" })

        const solicitud = await SolicitudArriendo.findById(id)
        if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" })
        // 404, not 403: a user must not be able to tell whether an id exists (AGENTS.md)
        if (!(await puedeVer(req, solicitud)))
            return res.status(404).json({ mensaje: "Solicitud no encontrada" })

        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Creates a rental request for the client linked to the logged-in user.
 *
 * Route: POST /api/solicitudes (CLIENTE only).
 * - Identity comes from the token (`usuarios.clienteId`), never from the body (rule 17).
 * - The property must exist, be active and be PUBLICADA (RN-12).
 * - `ejecutivoId` is copied from the property (D10); the request starts PENDIENTE.
 * - Logs a CREACION entry in the audit log (RN-13).
 *
 * Responses: 201 · 400 invalid data · 404 property/client not found ·
 * 409 no client profile or property not PUBLISHED · 500 server error.
 */
export const crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, antecedentes } = req.body ?? {}

        if (!mongoose.isValidObjectId(propiedadId) || !antecedentes || typeof antecedentes !== "object")
            return res.status(400).json({ mensaje: "propiedadId y antecedentes son obligatorios" })

        // The client identity always comes from the token, never from the body (rule 17)
        const clienteId = await clienteIdDelUsuario(req)
        if (!clienteId)
            return res.status(409).json({ mensaje: "Tu cuenta aún no tiene un perfil de cliente asociado" })

        const [propiedad, cliente] = await Promise.all([
            Propiedad.findOne({ _id: propiedadId, activo: true }),
            Cliente.findOne({ _id: clienteId, activo: true }),
        ])
        if (!propiedad) return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" })
        if (propiedad.estado !== "PUBLICADA")
            return res.status(409).json({ mensaje: "La propiedad no está PUBLICADA" })

        const { ingresosMensuales, ocupacion, numeroOcupantes, tieneMascotas } = antecedentes
        const solicitud = await SolicitudArriendo.create({
            propiedadId,
            clienteId,
            ejecutivoId: propiedad.ejecutivoId,
            antecedentes: { ingresosMensuales, ocupacion, numeroOcupantes, tieneMascotas },
        })

        await bitacoraSolicitud(req, solicitud, "CREACION", null, "PENDIENTE", "Solicitud creada")
        res.status(201).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Loads a request and checks that the user may change its state.
 * `soloGestores` restricts the change to the assigned executive (CU9).
 * Returns null after writing the error response, so callers can just return.
 */
const cargarParaCambio = async (req, res, { soloGestores }) => {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ mensaje: "ID inválido" })
        return null
    }
    const solicitud = await SolicitudArriendo.findById(id)
    if (!solicitud) {
        res.status(404).json({ mensaje: "Solicitud no encontrada" })
        return null
    }
    const { rol, _id } = req.usuario
    const permitido = soloGestores
        ? rol === "EJECUTIVO" && igual(solicitud.ejecutivoId, _id)
        : await puedeVer(req, solicitud)
    if (!permitido) {
        // Same as GET: hide whether the request exists from other users (AGENTS.md)
        res.status(404).json({ mensaje: "Solicitud no encontrada" })
        return null
    }
    return solicitud
}

/** Applies the state machine: only the listed source states may reach `destino`. */
const validarTransicion = (res, solicitud, permitidos, destino) => {
    if (!permitidos.includes(solicitud.estado)) {
        res.status(409).json({ mensaje: `Transición no permitida: ${solicitud.estado} → ${destino}` })
        return false
    }
    return true
}

/** Appends the optional `observacion` from the body to the request notes. */
const agregarObservacion = (req, solicitud) => {
    const texto = req.body?.observacion
    if (typeof texto === "string" && texto.trim())
        solicitud.observaciones.push({ texto: texto.trim(), usuarioId: req.usuario._id })
}

/**
 * Moves a pending request to EN_EVALUACION.
 *
 * Route: PATCH /api/solicitudes/:id/evaluar (assigned EJECUTIVO only, CU9).
 * - Only PENDIENTE -> EN_EVALUACION is allowed; any other state is 409.
 * - The optional `observacion` in the body is appended to `observaciones`.
 * - Logs a CAMBIO_ESTADO entry in the audit log (RN-13).
 *
 * Responses: 200 · 400 invalid id · 404 not found or not yours ·
 * 409 invalid transition · 500 server error.
 */
export const evaluarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: true })
        if (!solicitud) return
        if (!validarTransicion(res, solicitud, ["PENDIENTE"], "EN_EVALUACION")) return

        solicitud.estado = "EN_EVALUACION"
        agregarObservacion(req, solicitud)
        await solicitud.save()

        await bitacoraSolicitud(req, solicitud, "CAMBIO_ESTADO", "PENDIENTE", "EN_EVALUACION")
        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Approves an evaluated request and reserves its property.
 *
 * Route: PATCH /api/solicitudes/:id/aprobar (assigned EJECUTIVO only, CU9).
 * - Only EN_EVALUACION -> APROBADA is allowed (409 otherwise).
 * - The property must still be active and PUBLICADA; it becomes RESERVADA (RN-04).
 * - RN-14 is enforced atomically by the partial unique index (409 on conflict).
 * - Without transactions, the request is rolled back if reserving fails.
 * - Logs an audit entry for both the request and the property (RN-13).
 *
 * Responses: 200 · 400 invalid id · 404 request/property not found or not yours ·
 * 409 invalid transition or property not PUBLISHED · 500 server error.
 */
export const aprobarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: true })
        if (!solicitud) return
        if (!validarTransicion(res, solicitud, ["EN_EVALUACION"], "APROBADA")) return

        const propiedad = await Propiedad.findOne({ _id: solicitud.propiedadId, activo: true })
        if (!propiedad) return res.status(404).json({ mensaje: "Propiedad no encontrada" })
        if (propiedad.estado !== "PUBLICADA")
            return res.status(409).json({ mensaje: "La propiedad no está PUBLICADA" })

        solicitud.estado = "APROBADA"
        agregarObservacion(req, solicitud)
        await solicitud.save()

        try {
            propiedad.estado = "RESERVADA"
            await propiedad.save()
        } catch (errReserva) {
            solicitud.estado = "EN_EVALUACION"
            await solicitud.save()
            throw errReserva
        }

        await bitacoraSolicitud(req, solicitud, "RESERVA", "EN_EVALUACION", "APROBADA", "Propiedad reservada")
        await bitacoraPropiedad(req, propiedad, "RESERVA", "PUBLICADA", "RESERVADA", "Reservada por solicitud aprobada")
        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Rejects an evaluated rental request.
 *
 * Route: PATCH /api/solicitudes/:id/rechazar (assigned EJECUTIVO only, CU9).
 * - Only EN_EVALUACION -> RECHAZADA is allowed (409 otherwise).
 * - The optional `observacion` is appended; the audit log gets CAMBIO_ESTADO.
 *
 * Responses: 200 · 400 invalid id · 404 not found or not yours ·
 * 409 invalid transition · 500 server error.
 */
export const rechazarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: true })
        if (!solicitud) return
        if (!validarTransicion(res, solicitud, ["EN_EVALUACION"], "RECHAZADA")) return

        solicitud.estado = "RECHAZADA"
        agregarObservacion(req, solicitud)
        await solicitud.save()

        await bitacoraSolicitud(req, solicitud, "CAMBIO_ESTADO", "EN_EVALUACION", "RECHAZADA")
        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

/**
 * Cancels a rental request and releases its reservation when needed.
 *
 * Route: PATCH /api/solicitudes/:id/cancelar (owner CLIENTE or assigned EJECUTIVO).
 * - CLIENTE: only PENDIENTE -> CANCELADA (DATA_MODEL 6.2).
 * - EJECUTIVO: PENDIENTE or APROBADA -> CANCELADA; cancelling an approved request
 *   releases the property back to PUBLICADA (RF11/CU9, RN-04).
 * - Without transactions, the request is rolled back if releasing fails.
 * - Logs the request change and, when applicable, the property release (RN-13).
 *
 * Responses: 200 · 400 invalid id · 404 not found or not yours ·
 * 409 invalid transition · 500 server error.
 */
export const cancelarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: false })
        if (!solicitud) return

        // A client can only withdraw a pending request; releasing a reservation belongs to CU9
        const permitidos = req.usuario.rol === "CLIENTE" ? ["PENDIENTE"] : ["PENDIENTE", "APROBADA"]
        if (!validarTransicion(res, solicitud, permitidos, "CANCELADA")) return

        const estabaAprobada = solicitud.estado === "APROBADA"
        solicitud.estado = "CANCELADA"
        agregarObservacion(req, solicitud)
        await solicitud.save()

        if (estabaAprobada) {
            let propiedad = null
            try {
                propiedad = await Propiedad.findOne({ _id: solicitud.propiedadId, activo: true })
                if (propiedad && propiedad.estado === "RESERVADA") {
                    propiedad.estado = "PUBLICADA"
                    await propiedad.save()
                }
            } catch (errLiberar) {
                solicitud.estado = "APROBADA"
                await solicitud.save()
                throw errLiberar
            }
            await bitacoraSolicitud(req, solicitud, "LIBERACION_RESERVA", "APROBADA", "CANCELADA", "Propiedad liberada")
            if (propiedad && propiedad.estado === "PUBLICADA")
                await bitacoraPropiedad(req, propiedad, "LIBERACION_RESERVA", "RESERVADA", "PUBLICADA", "Reserva liberada")
        } else {
            await bitacoraSolicitud(req, solicitud, "CAMBIO_ESTADO", "PENDIENTE", "CANCELADA")
        }

        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}