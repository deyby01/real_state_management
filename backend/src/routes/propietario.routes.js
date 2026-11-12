import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getPropietarios, postPropietario, getPropietarioById, putPropietario, deletePropietario } from "../controllers/propietario.controller.js"

const propietarioRouter = Router()

// Every owner route is for executives only (CU2).
propietarioRouter.use(verificarToken, permitirRoles("EJECUTIVO"))

propietarioRouter.get("/", getPropietarios)
propietarioRouter.post("/", postPropietario)
propietarioRouter.get("/:id", getPropietarioById)
propietarioRouter.put("/:id", putPropietario)
propietarioRouter.delete("/:id", deletePropietario)

export default propietarioRouter