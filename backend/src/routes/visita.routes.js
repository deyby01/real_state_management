import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getVisitas, getVisitaById, postVisita } from "../controllers/visita.controller.js"

/**
 * Visit routes: list, detail and creation of visit requests.
 *
 * Mount: app.use("/api/visitas", visitaRouter) in backend/src/app.js.
 * Protection: all routes currently require authentication (verificarToken) and
 * allow only ADMIN and EJECUTIVO roles (permitirRoles).
 *
 * Note: CLIENTE endpoints are deferred until usuarios.clienteId is linked with
 * the Clientes model (Jose).
 */
const visitaRouter = Router()

visitaRouter.use(verificarToken, permitirRoles("ADMIN", "EJECUTIVO"))

visitaRouter.get("/", getVisitas)
visitaRouter.get("/:id", getVisitaById)
visitaRouter.post("/", postVisita)

export default visitaRouter