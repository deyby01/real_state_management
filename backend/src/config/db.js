import mongoose from "mongoose"

const URI = process.env.MONGO_URI

export const connectDB = async() => {
    if (!URI) {
        console.log("Falta la variable MONGO_URI. Revisa tu archivo .env (usa .env.example como guía)")
        return
    }
    try{
        await mongoose.connect(URI)
        console.log("Base de datos conectada")
    } catch (error) {
        console.log(error)
    }
}
