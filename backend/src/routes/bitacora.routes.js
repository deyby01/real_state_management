import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getBitacora } from "../controllers/bitacora.controller.js"

/**
 * Audit log routes, mounted at /api/bitacora.
 * The whole router is ADMIN only. There are no POST, PUT or DELETE routes:
 * entries are created by the backend itself through registrarBitacora.
 */
const bitacoraRouter = Router()

// Protects every route of this router, including future ones (secure by default)
bitacoraRouter.use(verificarToken, permitirRoles("ADMIN"))
bitacoraRouter.get("/", getBitacora)

export default bitacoraRouter