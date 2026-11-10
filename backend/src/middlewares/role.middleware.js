/**
 * Authorization middleware factory: only lets the given roles continue.
 * Must run AFTER verificarToken, which sets `req.usuario`.
 *
 * @example
 * router.post("/", verificarToken, permitirRoles("ADMIN"), postTipoPropiedad)
 * router.use(verificarToken, permitirRoles("EJECUTIVO"))   // whole router
 *
 * @param {...string} roles - Allowed roles: "ADMIN", "EJECUTIVO", "PROPIETARIO", "CLIENTE".
 * @returns {Function} An Express middleware that responds 403 for any other role.
 */
export const permitirRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" })
        }
        next()
    }
}