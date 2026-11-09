import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { crearPropiedad, listarPropiedades, obtenerPropiedad } from "../controllers/propiedad.controller.js"

const propiedadRouter = Router()

propiedadRouter.use(verificarToken, permitirRoles("EJECUTIVO"))
propiedadRouter.post("/", crearPropiedad)
propiedadRouter.get("/", listarPropiedades)
propiedadRouter.get("/:id", obtenerPropiedad)

export default propiedadRouter