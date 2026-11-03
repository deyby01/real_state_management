import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getBitacora } from "../controllers/bitacora.controller.js"

const bitacoraRouter = Router()

bitacoraRouter.use(verificarToken, permitirRoles("ADMIN"))
bitacoraRouter.get("/", getBitacora)

export default bitacoraRouter