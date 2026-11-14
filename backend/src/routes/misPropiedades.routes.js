import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { listarMisPropiedades, obtenerMiPropiedad } from "../controllers/propiedad.controller.js"

/**
 * Owner's view of their own properties, mounted at /api/mis-propiedades (spec §9).
 * Kept apart from /api/propiedades because that router is EJECUTIVO only:
 * its router.use would answer 403 to an owner before reaching any route.
 */
const misPropiedadesRouter = Router()

misPropiedadesRouter.use(verificarToken, permitirRoles("PROPIETARIO"))
misPropiedadesRouter.get("/", listarMisPropiedades)
misPropiedadesRouter.get("/:id", obtenerMiPropiedad)

export default misPropiedadesRouter
