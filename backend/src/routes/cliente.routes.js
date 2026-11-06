import { Router } from "express"
import { getClientes, getClienteById, postCliente, putCliente } from "../controllers/cliente.controller.js"

const clienteRouter = Router()

clienteRouter.get("/", getClientes)
clienteRouter.post("/", postCliente)
clienteRouter.get("/:id", getClienteById)
clienteRouter.put("/:id", putCliente)

export default clienteRouter