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
import propietarioRouter from "./routes/propietario.routes.js"
import clienteRouter from "./routes/cliente.routes.js"
import propiedadRouter from "./routes/propiedad.routes.js"
import solicitudRouter from "./routes/solicitudArriendo.routes.js"
import catalogoRouter from "./routes/catalogo.routes.js"
import misPropiedadesRouter from "./routes/misPropiedades.routes.js"
import visitaRouter from "./routes/visita.routes.js"

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
app.use("/api/propietarios", propietarioRouter)

app.use("/api/clientes", clienteRouter)
app.use("/api/propiedades", propiedadRouter)

app.use("/api/solicitudes", solicitudRouter)

// Public: no token.
app.use("/api/catalogo", catalogoRouter)

app.use("/api/mis-propiedades", misPropiedadesRouter)

app.use("/api/visitas", visitaRouter)

export default app