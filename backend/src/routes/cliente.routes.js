import { Router } from "express"
import { getClientes, getClienteById } from "../controllers/cliente.controller.js"

const clienteRouter = Router()

clienteRouter.get("/", getClientes)
clienteRouter.get("/:id", getClienteById)

export default clienteRouter