import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getClientes, getClienteById, postCliente, putCliente, deleteCliente } from "../controllers/cliente.controller.js"

/**
 * Client routes, mounted at /api/clientes.
 * Every route requires a valid token (RNF-04): the client portfolio is internal
 * data, so public users (CLIENTE, PROPIETARIO) get 403.
 * ADMIN and EJECUTIVO manage clients; DELETE is ADMIN only (least privilege),
 * because deactivating a client is more sensitive than editing one.
 */
const clienteRouter = Router()

clienteRouter.get("/", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), getClientes)
clienteRouter.post("/", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), postCliente)
clienteRouter.get("/:id", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), getClienteById)
clienteRouter.put("/:id", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), putCliente)

// Soft delete: the controller sets activo: false, the document is never removed (rule 11)
clienteRouter.delete("/:id", verificarToken, permitirRoles("ADMIN"), deleteCliente)

export default clienteRouter
