import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getTipoPropiedad, postTipoPropiedad } from "../controllers/tipoPropiedad.controller.js"

const tipoRouter = Router()

tipoRouter.get("/", getTipoPropiedad)
tipoRouter.post("/", verificarToken, permitirRoles("ADMIN"), postTipoPropiedad)

export default tipoRouter