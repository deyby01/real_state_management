import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getVisitas, getVisitaById } from "../controllers/visita.controller.js"

const visitaRouter = Router()

// Protegemos todas las rutas: solo ADMIN y EJECUTIVO
visitaRouter.use(verificarToken, permitirRoles("ADMIN", "EJECUTIVO"))

visitaRouter.get("/", getVisitas)
visitaRouter.get("/:id", getVisitaById)

export default visitaRouter