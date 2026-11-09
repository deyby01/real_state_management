import Visita, { ESTADOS_VISITA, DURACION_VISITA_MS } from "../models/Visita.js"
import { registrarBitacora } from "../services/bitacora.service.js"

// GET /api/visitas
// Filtros opcionales: ?estado=, ?propiedadId=, ?ejecutivoId=, ?desde=, ?hasta=
export const getVisitas = async (req, res) => {
    try {
        const { estado, propiedadId, ejecutivoId, desde, hasta } = req.query
        const filtro = {}

        // Validación y filtro por estado
        if (estado) {
            if (!ESTADOS_VISITA.includes(estado)) {
                return res.status(400).json({
                    mensaje: `Estado inválido. Los estados permitidos son: ${ESTADOS_VISITA.join(", ")}`
                })
            }
            filtro.estado = estado
        }

        // Filtros por IDs relacionados
        if (propiedadId) filtro.propiedadId = propiedadId
        if (ejecutivoId) filtro.ejecutivoId = ejecutivoId

        // Rango de fechas (agenda)
        if (desde || hasta) {
            filtro.fechaInicio = {}

            if (desde) {
                const fechaDesde = new Date(desde)
                if (isNaN(fechaDesde.getTime())) {
                    return res.status(400).json({ mensaje: "Parámetro 'desde' inválido. Debe ser una fecha válida" })
                }
                filtro.fechaInicio.$gte = fechaDesde
            }

            if (hasta) {
                const fechaHasta = new Date(hasta)
                if (isNaN(fechaHasta.getTime())) {
                    return res.status(400).json({ mensaje: "Parámetro 'hasta' inválido. Debe ser una fecha válida" })
                }
                filtro.fechaInicio.$lte = fechaHasta
            }
        }

        // Consultamos ordenando por fechaInicio ascendente (próximas primero)
        // Poblamos solo ejecutivoId (Usuario ya existe en el repo)
        const visitas = await Visita.find(filtro)
            .sort({ fechaInicio: 1 })
            .populate("ejecutivoId", "nombre email rol")

        res.status(200).json(visitas)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "ID inválido en los parámetros de búsqueda",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al obtener las visitas", error: error.message })
    }
}

// GET /api/visitas/:id
export const getVisitaById = async (req, res) => {
    try {
        const { id } = req.params

        const visita = await Visita.findById(id).populate("ejecutivoId", "nombre email rol")

        if (!visita) {
            return res.status(404).json({ mensaje: "Visita no encontrada" })
        }

        res.status(200).json(visita)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "ID de visita inválido",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al obtener la visita", error: error.message })
    }
}

// POST /api/visitas
// Crea una nueva visita con validación de solapamiento (RN-10) y registro en bitácora (RN-13)
export const postVisita = async (req, res) => {
    try {
        // Concepto 1: Lista blanca de campos (nunca tomar estado o resultado del body)
        const { propiedadId, clienteId, ejecutivoId, fechaInicio, observaciones } = req.body

        // 1. Validar presencia de campos obligatorios
        if (!propiedadId || !clienteId || !ejecutivoId || !fechaInicio) {
            return res.status(400).json({
                mensaje: "Los campos propiedadId, clienteId, ejecutivoId y fechaInicio son obligatorios"
            })
        }

        // 2. Convertir y validar fechaInicio (debe ser válida y futura)
        const fechaInicioDate = new Date(fechaInicio)
        if (isNaN(fechaInicioDate.getTime())) {
            return res.status(400).json({ mensaje: "La fecha de inicio no es válida" })
        }
        if (fechaInicioDate <= new Date()) {
            return res.status(400).json({ mensaje: "La fecha de inicio debe ser futura" })
        }

        // 3. Calcular fechaFin para la consulta de solapamiento (D8)
        const fechaFinDate = new Date(fechaInicioDate.getTime() + DURACION_VISITA_MS)

        // 4. Chequeo de solapamiento de horario para el ejecutivo (RN-10)
        // Dos intervalos chocan si: existente.inicio < nuevo.fin && existente.fin > nuevo.inicio
        const solapada = await Visita.findOne({
            ejecutivoId,
            estado: { $nin: ["CANCELADA", "RECHAZADA"] },
            fechaInicio: { $lt: fechaFinDate },
            fechaFin: { $gt: fechaInicioDate }
        })

        if (solapada) {
            return res.status(409).json({
                mensaje: "El ejecutivo ya tiene una visita agendada en ese horario",
                visitaEnConflicto: {
                    id: solapada._id,
                    fechaInicio: solapada.fechaInicio,
                    fechaFin: solapada.fechaFin,
                    estado: solapada.estado
                }
            })
        }

        // 5. Crear el documento (nace en estado SOLICITADA por defecto)
        const nuevaVisita = new Visita({
            propiedadId,
            clienteId,
            ejecutivoId,
            fechaInicio: fechaInicioDate,
            observaciones
        })

        const visitaGuardada = await nuevaVisita.save()

        // 6. Registrar en Bitácora (RN-13) - omitimos estadoAnterior en creación para no guardar un null
        await registrarBitacora({
            entidad: "VISITA",
            entidadId: visitaGuardada._id,
            accion: "CREACION",
            estadoNuevo: "SOLICITADA",
            usuarioId: req.usuario._id,
            observacion: "Visita solicitada"
        })

        // 7. Poblar ejecutivoId para que la respuesta tenga la misma forma que el GET
        await visitaGuardada.populate("ejecutivoId", "nombre email rol")

        // 8. Responder 201 Created
        res.status(201).json(visitaGuardada)
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                mensaje: "Formato de ID inválido en el cuerpo de la petición",
                error: error.message
            })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({
                mensaje: "Error de validación del modelo",
                error: error.message
            })
        }
        res.status(500).json({ mensaje: "Error al crear la visita", error: error.message })
    }
}