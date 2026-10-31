import { Router } from "express"
import { getTipoPropiedad, postTipoPropiedad } from "../controllers/tipoPropiedad.controller.js"

const tipoRouter = Router()

tipoRouter.get("/", getTipoPropiedad)
tipoRouter.post("/", postTipoPropiedad)

export default tipoRouter