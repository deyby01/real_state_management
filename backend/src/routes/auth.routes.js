import { Router } from "express"
import { verificarToken } from "../middlewares/auth.middleware.js"
import { register, login, me } from "../controllers/auth.controller.js"

/**
 * Authentication routes, mounted at /api/auth.
 * register and login are public; me needs a valid token (any role).
 */
const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.get("/me", verificarToken, me)

export default authRouter