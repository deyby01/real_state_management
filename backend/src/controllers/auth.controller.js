import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"

/**
 * Registers a new account from the public sign-up form.
 *
 * Route: POST /api/auth/register (public).
 * - The account is always CLIENTE: `rol` is never read from the body (rule 17).
 * - The password is hashed with bcryptjs before saving (rule 15) and is never
 *   returned (rule 16). Password confirmation is validated in the frontend.
 *
 * Responses: 201 created · 400 invalid data or password under 8 characters ·
 * 409 email already registered.
 */
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

/**
 * Logs a user in and returns a signed JWT.
 *
 * Route: POST /api/auth/login (public).
 * - A wrong email and a wrong password get the same 401 message, so nobody can
 *   find out which emails are registered; inactive users cannot log in (rule 18).
 * - The token payload holds only `_id` and `rol` (rule 19) and expires after
 *   JWT_EXPIRES_IN.
 *
 * Responses: 200 { token, usuario } · 400 missing email or password ·
 * 401 invalid credentials · 500 server error.
 */
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

/**
 * Returns the logged-in user's public data.
 *
 * Route: GET /api/auth/me (any logged-in user, after verificarToken).
 *
 * Responses: 200 user · 401 no/invalid token, or the user no longer exists or
 * is inactive · 500 server error.
 */
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