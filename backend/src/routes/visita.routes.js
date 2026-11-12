import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import {
    getVisitas,
    getVisitaById,
    postVisita,
    putVisita,
    confirmarVisita,
    rechazarVisita,
    cancelarVisita,
    registrarResultadoVisita
} from "../controllers/visita.controller.js"

/**
 * Visit routes: list, detail, creation, rescheduling and state machine transitions.
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

// Reading and creation
visitaRouter.get("/", getVisitas)
visitaRouter.get("/:id", getVisitaById)
visitaRouter.post("/", postVisita)

// Rescheduling (RF7)
visitaRouter.put("/:id", putVisita)

// State machine transitions (§6.3)
visitaRouter.patch("/:id/confirmar", confirmarVisita)
visitaRouter.patch("/:id/rechazar", rechazarVisita)
visitaRouter.patch("/:id/cancelar", cancelarVisita)
visitaRouter.patch("/:id/resultado", registrarResultadoVisita)

export default visitaRouter