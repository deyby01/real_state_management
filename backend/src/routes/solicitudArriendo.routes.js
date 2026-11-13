import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import {
    listarSolicitudes,
    obtenerSolicitud,
    crearSolicitud,
    evaluarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    cancelarSolicitud,
} from "../controllers/solicitudArriendo.controller.js"

const router = Router()

router.use(verificarToken)

router.post("/", permitirRoles("CLIENTE"), crearSolicitud)
router.get("/", permitirRoles("CLIENTE", "EJECUTIVO"), listarSolicitudes)
router.get("/:id", permitirRoles("CLIENTE", "EJECUTIVO"), obtenerSolicitud)
router.patch("/:id/evaluar", permitirRoles("EJECUTIVO"), evaluarSolicitud)
router.patch("/:id/aprobar", permitirRoles("EJECUTIVO"), aprobarSolicitud)
router.patch("/:id/rechazar", permitirRoles("EJECUTIVO"), rechazarSolicitud)
router.patch("/:id/cancelar", permitirRoles("CLIENTE", "EJECUTIVO"), cancelarSolicitud)

export default router