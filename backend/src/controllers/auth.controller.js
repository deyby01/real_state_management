import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ mensaje: "Email y contraseña son requeridos" })
        }

        // Find user by email with passwordHash included
        const usuario = await Usuario.findOne({ email }).select("+passwordHash")

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" })
        }

        // Compare password
        const coincide = await bcrypt.compare(password, usuario.passwordHash)
        if (!coincide) {
            return res.status(401).json({ mensaje: "Credenciales inválidas" })
        }

        // Sign JWT token
        const token = jwt.sign(
            { _id: usuario._id, rol: usuario.rol},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        // Return user data without passwordHash and include token
        res.status(200).json({
            token,
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        })
    } catch (error) {
        res.status(500).json({ mensaje: "Error al iniciar sesión", error: error.message })
    }
}

export const me = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario._id)

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ mensaje: "Usuario no encontrado" })
        }

        res.status(200).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        })
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el usuario", error: error.message })
    }
}