import bcrypt from "bcryptjs"
import Usuario from "../models/Usuario.js"

export const register = async (req, res) => {
    try {
        // Get data from request body
        const { nombre, email, password} = req.body

        // Validate pwd before hashing
        if (!password || password.length < 8) {
            return res.status(400).json({mensaje: "La contraseña debe tener al menos 8 caracteres"})
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10)

        // Create user without role, model will assign default role
        const usuario = await Usuario.create({ nombre, email, passwordHash })

        // Return without passwordHash
        res.status(201).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        })
    } catch (error) {
        if (error.code === 11000){
            return res.status(409).json({mensaje: "El correo ya está registrado", error: error.message})
        }
        res.status(400).json({mensaje: "Error al registrar el usuario", error: error.message})
    }
}