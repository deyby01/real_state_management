import jwt from "jsonwebtoken"

export const verificarToken = (req, res, next) => {
    // Read header
    const header = req.headers.authorization

    // Check if header exists and starts with "Bearer "
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ mensaje: "Token no proporcionado" })
    }

    // Extract token
    const token = header.split(" ")[1]

    try {
        // Verify token
        const datos = jwt.verify(token, process.env.JWT_SECRET)
        // Save data for controller
        req.usuario = datos
        next()
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado", error: error.message })
    }
}