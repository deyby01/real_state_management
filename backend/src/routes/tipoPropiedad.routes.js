import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getTipoPropiedad, postTipoPropiedad } from "../controllers/tipoPropiedad.controller.js"

/**
 * Property type routes, mounted at /api/tipo-propiedades.
 * Protected route by route: GET is public (catalog filter), POST is ADMIN only.
 */
const tipoRouter = Router()

tipoRouter.get("/", getTipoPropiedad)
tipoRouter.post("/", verificarToken, permitirRoles("ADMIN"), postTipoPropiedad)

export default tipoRouter