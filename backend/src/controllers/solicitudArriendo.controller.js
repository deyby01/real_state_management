import mongoose from "mongoose"
import SolicitudArriendo from "../models/SolicitudArriendo.js"
import Usuario from "../models/Usuario.js"
import Propiedad from "../models/Propiedad.js"
import Cliente from "../models/Cliente.js"
import { registrarBitacora } from "../services/bitacora.service.js"

const manejarError = (res, error) => {
    if (error.code === 11000)
        return res.status(409).json({ mensaje: "Ya existe una solicitud aprobada para esta propiedad" })
    if (error.name === "CastError") return res.status(400).json({ mensaje: "ID inválido" })
    if (error.name === "ValidationError")
        return res.status(400).json({ mensaje: "Datos inválidos", error: error.message })
    return res.status(500).json({ mensaje: "Error interno del servidor", error: error.message })
}

const igual = (a, b) => Boolean(a && b) && String(a) === String(b)

const clienteIdDelUsuario = async (req) => {
    const usuario = await Usuario.findById(req.usuario._id).select("clienteId")
    return usuario?.clienteId ?? null
}

const puedeVer = async (req, solicitud) => {
    const { rol, _id } = req.usuario
    if (rol === "ADMIN") return true
    if (rol === "EJECUTIVO") return igual(solicitud.ejecutivoId, _id)
    if (rol === "CLIENTE") return igual(solicitud.clienteId, await clienteIdDelUsuario(req))
    return false
}

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

export const listarSolicitudes = async (req, res) => {
    try {
        const { rol, _id } = req.usuario
        let filtro = {}
        if (rol === "CLIENTE") filtro = { clienteId: await clienteIdDelUsuario(req) }
        else if (rol === "EJECUTIVO") filtro = { ejecutivoId: _id }
        else if (rol !== "ADMIN") return res.status(403).json({ mensaje: "Sin permisos" })

        const solicitudes = await SolicitudArriendo.find(filtro).sort({ createdAt: -1 })
        res.status(200).json(solicitudes)
    } catch (error) {
        manejarError(res, error)
    }
}

export const obtenerSolicitud = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: "ID inválido" })

        const solicitud = await SolicitudArriendo.findById(id)
        if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" })
        if (!(await puedeVer(req, solicitud)))
            return res.status(403).json({ mensaje: "No tienes acceso a esta solicitud" })

        res.status(200).json(solicitud)
    } catch (error) {
        manejarError(res, error)
    }
}

export const crearSolicitud = async (req, res) => {
    try {
        const { propiedadId, antecedentes } = req.body

        if (!mongoose.isValidObjectId(propiedadId) || !antecedentes || typeof antecedentes !== "object")
            return res.status(400).json({ mensaje: "propiedadId y antecedentes son obligatorios" })


        const clienteId = (await clienteIdDelUsuario(req)) ?? req.body?.clienteId ?? null
        if (!mongoose.isValidObjectId(clienteId))
            return res.status(400).json({ mensaje: "clienteId inválido o ausente" })

        const [propiedad, cliente] = await Promise.all([
            Propiedad.findById(propiedadId),
            Cliente.findById(clienteId),
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
        ? rol === "ADMIN" || (rol === "EJECUTIVO" && igual(solicitud.ejecutivoId, _id))
        : await puedeVer(req, solicitud)
    if (!permitido) {
        res.status(403).json({ mensaje: "No tienes permisos sobre esta solicitud" })
        return null
    }
    return solicitud
}

const validarTransicion = (res, solicitud, permitidos, destino) => {
    if (!permitidos.includes(solicitud.estado)) {
        res.status(409).json({ mensaje: `Transición no permitida: ${solicitud.estado} → ${destino}` })
        return false
    }
    return true
}

const agregarObservacion = (req, solicitud) => {
    const texto = req.body?.observacion
    if (typeof texto === "string" && texto.trim())
        solicitud.observaciones.push({ texto: texto.trim(), usuarioId: req.usuario._id })
}

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

export const aprobarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: true })
        if (!solicitud) return
        if (!validarTransicion(res, solicitud, ["EN_EVALUACION"], "APROBADA")) return

        const propiedad = await Propiedad.findById(solicitud.propiedadId)
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

export const cancelarSolicitud = async (req, res) => {
    try {
        const solicitud = await cargarParaCambio(req, res, { soloGestores: false })
        if (!solicitud) return
        if (!validarTransicion(res, solicitud, ["PENDIENTE", "APROBADA"], "CANCELADA")) return

        const estabaAprobada = solicitud.estado === "APROBADA"
        solicitud.estado = "CANCELADA"
        agregarObservacion(req, solicitud)
        await solicitud.save()

        if (estabaAprobada) {
            let propiedad = null
            try {
                propiedad = await Propiedad.findById(solicitud.propiedadId)
                if (propiedad && propiedad.estado === "RESERVADA") {
                    propiedad.estado = "PUBLICADA"
                    await propiedad.save()
                }
            } catch (errLiberar) {
                solicitud.estado = "APROBADA"; 
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