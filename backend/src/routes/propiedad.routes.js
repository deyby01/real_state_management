import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { crearPropiedad, 
    listarPropiedades, 
    obtenerPropiedad, 
    actualizarPropiedad, 
    eliminarPropiedad, 
    cambiarEstadoPropiedad } from "../controllers/propiedad.controller.js"

const propiedadRouter = Router()

propiedadRouter.use(verificarToken, permitirRoles("EJECUTIVO"))
propiedadRouter.post("/", crearPropiedad)
propiedadRouter.get("/", listarPropiedades)
propiedadRouter.get("/:id", obtenerPropiedad)
propiedadRouter.put("/:id", actualizarPropiedad)
propiedadRouter.delete("/:id", eliminarPropiedad)
propiedadRouter.patch("/:id/estado", cambiarEstadoPropiedad)

export default propiedadRouter