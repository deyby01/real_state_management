import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"
import { getClientes, getClienteById, postCliente, putCliente, deleteCliente } from "../controllers/cliente.controller.js"

/**
 * Client routes, mounted at /api/clientes.
 * The whole router is EJECUTIVO only (spec CU5 "Administrar clientes interesados"):
 * the use-case matrix does not give the Admin access here, so it gets 403.
 * Every route also needs a valid token (RNF-04), because the client portfolio is
 * internal data and public users (CLIENTE, PROPIETARIO) must not read it.
 *
 * The role check lives in router.use() instead of on each route: the five routes
 * share the same rule, so it is declared once and cannot drift, leaked or missed
 * when a new endpoint is added later.
 */
const clienteRouter = Router()

clienteRouter.use(verificarToken, permitirRoles("EJECUTIVO"))

clienteRouter.get("/", getClientes)
clienteRouter.post("/", postCliente)
clienteRouter.get("/:id", getClienteById)
clienteRouter.put("/:id", putCliente)

// Soft delete: the controller sets activo: false, the document is never removed (rule 11)
clienteRouter.delete("/:id", deleteCliente)

export default clienteRouter
