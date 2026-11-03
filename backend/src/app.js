import express from "express"
import morgan from "morgan"
import tipoRouter from "./routes/tipoPropiedad.routes.js"
import authRouter from "./routes/auth.routes.js"
import bitacoraRouter from "./routes/bitacora.routes.js"

const app = express()
app.use(express.json())
app.use(morgan("dev"))

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
})

app.use("/api/tipo-propiedades", tipoRouter)

app.use("/api/auth", authRouter)

app.use("/api/bitacora", bitacoraRouter)

export default app
