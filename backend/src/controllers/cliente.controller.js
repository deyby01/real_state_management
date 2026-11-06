import Cliente from "../models/Cliente.js"

const normalizarRut = (rut) => {
    if (!rut) return rut
    // Eliminar puntos y espacios
    return String(rut).replace(/\./g, "").replace(/\s/g, "").toUpperCase()
}

export const getClientes = async (req, res) => {
    try {
        // find() siempre devuelve un arreglo (aunque esté vacío)
        const clientes = await Cliente.find({ activo: true })
        res.status(200).json(clientes)
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener clientes", error: error.message })
    }
}

export const getClienteById = async (req, res) => {
    try {
        // findById() devuelve UN documento o null
        const cliente = await Cliente.findById(req.params.id)
        
        if (!cliente) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" })
        }

        res.status(200).json(cliente)
    } catch (error) {
        // "abc" no se puede convertir a ObjectId: Mongoose lanza CastError
        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de cliente inválido", error: error.message })
        }
        res.status(500).json({ mensaje: "Error al obtener cliente", error: error.message })
    }
}

export const postCliente = async (req, res) => {
    try {
        //lista blanca: solo estos campos desde el body
        const { rut, nombre, email, telefono, ciudad, comuna, estado } = req.body

        const nuevoCliente = await Cliente.create({
            rut: normalizarRut(rut),
            nombre,
            email,
            telefono,
            ciudad,
            comuna,
            estado,
        })
        res.status(201).json(nuevoCliente)
    } catch (error) {
        //1) indice unico, MongoDB responde 11000
        if (error.code === 11000) {
            const campo = Object.keys(error.keyValue)[0]
            return res.status(409).json({
                mensaje: `Ya existe un cliente con ese ${campo}`,
                error: error.message,
            })

        }
        //2) required faltante o enum inválido
        if (error.name === "ValidationError") {
            const campos = Object.keys(error.errors).join(", ")
            return res.status(400).json({ 
                mensaje: `Datos inválidos: ${campos}`,
                error: error.message,
            })
        }
        // 3)cualquier otro error
        res.status(500).json({ mensaje: "Error al crear cliente", error: error.message })
    }
}

export const putCliente = async (req, res) => {
    try {
        const { rut, nombre, email, telefono, ciudad, comuna, estado } = req.body

        const datos = {nombre, email, telefono, ciudad, comuna, estado}

        // el rut solo se toca si vino en el body
        if (rut !== undefined) {
            datos.rut = normalizarRut(rut)
        }

        const cliente = await Cliente.findByIdAndUpdate(req.params.id, datos, {
            new: true,
            runValidators: true
        })

        if (!cliente) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" })
        }

        res.status(200).json(cliente)
    } catch (error) {
        if (error.code === 11000) {
            const campo = Object.keys(error.keyValue)[0]
            return res.status(409).json({
                mensaje: `Ya existe un cliente con ese ${campo}`,
                error: error.message,
            })
        }

        if (error.name === "ValidationError") {
            const campos = Object.keys(error.errors).join(", ")
            return res.status(400).json({
                mensaje: `Datos inválidos: ${campos}`,
                error: error.message,
            })
        }

        if (error.name === "CastError") {
            return res.status(400).json({ mensaje: "ID de cliente inválido", error: error.message })
        }
        res.status(500).json({ mensaje: "Error al actualizar cliente", error: error.message })
    }
}