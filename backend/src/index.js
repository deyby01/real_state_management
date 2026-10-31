import app from "./app.js"
import {connectDB } from "./config/db.js"

const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET

const iniciarServidor = async () => {
    try {
        if (!JWT_SECRET) {
            throw new Error("Falta la variable JWT_SECRET. Revisa docker-compose.yml o tu archivo .env (usa .env.example como guia)")
        }

        await connectDB()

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`)
        })
    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error.message)
        process.exit(1)
    }
}

iniciarServidor()