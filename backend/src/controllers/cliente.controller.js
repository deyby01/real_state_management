import Cliente from "../models/Cliente.js"

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

