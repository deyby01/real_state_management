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
router.get("/", permitirRoles("CLIENTE", "EJECUTIVO", "ADMIN"), listarSolicitudes)
router.get("/:id", permitirRoles("CLIENTE", "EJECUTIVO", "ADMIN"), obtenerSolicitud)
router.patch("/:id/evaluar", permitirRoles("EJECUTIVO", "ADMIN"), evaluarSolicitud)
router.patch("/:id/aprobar", permitirRoles("EJECUTIVO", "ADMIN"), aprobarSolicitud)
router.patch("/:id/rechazar", permitirRoles("EJECUTIVO", "ADMIN"), rechazarSolicitud)
router.patch("/:id/cancelar", permitirRoles("CLIENTE", "EJECUTIVO", "ADMIN"), cancelarSolicitud)

export default router