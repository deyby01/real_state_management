import app from "./app.js"
import {connectDB } from "./config/db.js"

const PORT = process.env.PORT || 4000

const iniciarServidor = async () => {
    try {
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