import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { register, login, me } from "../controllers/auth.controller.js"

const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.get("/me", verificarToken, me)

export default authRouter