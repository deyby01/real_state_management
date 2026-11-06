import { Router } from "express"
import { getClientes, getClienteById, postCliente } from "../controllers/cliente.controller.js"

const clienteRouter = Router()

clienteRouter.get("/", getClientes)
clienteRouter.post("/", postCliente)
clienteRouter.get("/:id", getClienteById)


export default clienteRouter