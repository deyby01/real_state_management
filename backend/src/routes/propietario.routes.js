import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getPropietarios, postPropietario, getPropietarioById, putPropietario, deletePropietario } from "../controllers/propietario.controller.js"

const propietarioRouter = Router()

propietarioRouter.get(
    "/",
    verificarToken,
    permitirRoles("EJECUTIVO"),
    getPropietarios
)

propietarioRouter.post(
    "/",
    verificarToken,
    permitirRoles("EJECUTIVO"),
    postPropietario
)

propietarioRouter.get("/:id", verificarToken, permitirRoles("EJECUTIVO"), getPropietarioById)
propietarioRouter.put("/:id", verificarToken, permitirRoles("EJECUTIVO"), putPropietario)
propietarioRouter.delete("/:id", verificarToken, permitirRoles("EJECUTIVO"), deletePropietario)

export default propietarioRouter
