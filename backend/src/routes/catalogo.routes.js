import { Router } from "express"
import { listarCatalogo, obtenerPropiedadCatalogo } from "../controllers/propiedad.controller.js"

const catalogoRouter = Router()

catalogoRouter.get("/", listarCatalogo)
catalogoRouter.get("/:id", obtenerPropiedadCatalogo)

export default catalogoRouter