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
 * Protection: every route requires authentication and the EJECUTIVO role (RF7).
 * - ADMIN has no visit use case in this module; visit reporting will use
 *   GET /api/reportes/visitas when implemented (RF12).
 * - CLIENTE is deferred to the follow-up PR (CU6: request and cancel own visits):
 *   the `usuarios.clienteId` link already exists (PR #33), so that PR only needs the
 *   session-based clienteId, the ownership check and populate("clienteId").
 * - Any EJECUTIVO may manage any visit (Decision A); per-executive-only restrictions
 *   remain a proposal pending professor validation.
 */
const visitaRouter = Router()

visitaRouter.use(verificarToken, permitirRoles("EJECUTIVO"))

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