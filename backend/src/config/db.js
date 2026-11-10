import mongoose from "mongoose"

const URI = process.env.MONGO_URI

/**
 * Connects Mongoose to MongoDB using the MONGO_URI environment variable.
 * Called once at startup by index.js (and by the fixtures seed).
 *
 * @throws {Error} If MONGO_URI is missing or the connection fails, so the server
 *                 stops instead of running without a database.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
    if (!URI) {
        throw new Error("Falta la variable MONGO_URI. Revisa docker-compose.yml o tu archivo .env (usa .env.example como guia)")
    }

    await mongoose.connect(URI)
    console.log("Base de datos conectada")
}
