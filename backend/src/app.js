/**
 * Express application: global middlewares and the routers of each feature.
 * Kept apart from index.js (which starts the server) so the app can be reused.
 * Each model adds one import and one app.use() at the end of its block.
 */
import express from "express"
import morgan from "morgan"
import tipoRouter from "./routes/tipoPropiedad.routes.js"
import authRouter from "./routes/auth.routes.js"
import bitacoraRouter from "./routes/bitacora.routes.js"
import propiedadRouter from "./routes/propiedad.routes.js"

const app = express()
app.use(express.json())
app.use(morgan("dev"))

// Health check: lets Docker and the team know the API is up
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
})

app.use("/api/tipo-propiedades", tipoRouter)

app.use("/api/auth", authRouter)

app.use("/api/bitacora", bitacoraRouter)

app.use("/api/propiedades", propiedadRouter)

export default app
