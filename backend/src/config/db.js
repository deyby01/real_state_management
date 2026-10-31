import mongoose from "mongoose"

const URI = process.env.MONGO_URI

export const connectDB = async () => {
    if (!URI) {
        throw new Error("Falta la variable MONGO_URI. Revisa docker-compose.yml o tu archivo .env (usa .env.example como guia)")
    }

    await mongoose.connect(URI)
    console.log("Base de datos conectada")
}
