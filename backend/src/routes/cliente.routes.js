import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getClientes, getClienteById, postCliente, putCliente, deleteCliente } from "../controllers/cliente.controller.js"

const clienteRouter = Router()

clienteRouter.get("/", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), getClientes)
clienteRouter.post("/", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), postCliente)
clienteRouter.get("/:id", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), getClienteById)
clienteRouter.put("/:id", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), putCliente)
clienteRouter.delete("/:id", verificarToken, permitirRoles("ADMIN"), deleteCliente)

export default clienteRouter