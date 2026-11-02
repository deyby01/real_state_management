# usuarios — Usuario + authentication

> **Owner:** Deyby · **Branch:** `feature/deyby/jwt-auth-setup` · **Status:** ✅ Merged (PR #20, 2026-11-01)
> **Specification:** [`docs/DATA_MODEL.md → usuarios`](../docs/DATA_MODEL.md#usuarios-login-accounts)
> **Depends on:** — · **Used by:** every protected route (`verificarToken`, `permitirRoles`); `propietarios` and `clientes` (linked through `propietarioId` / `clienteId`)

## What other models can reuse

This is the part teammates need when they protect their own routes:

```js
import { verificarToken } from "../middlewares/auth.middleware.js"
import { permitirRoles } from "../middlewares/role.middleware.js"

router.get("/", verificarToken, permitirRoles("ADMIN", "EJECUTIVO"), getAlgo)
```

- `verificarToken` checks the `Authorization: Bearer <token>` header and leaves the logged-in user in `req.usuario` (`{ _id, rol }`). No, invalid or expired token → `401`.
- `permitirRoles(...roles)` must go **after** `verificarToken`. Role not in the list → `403`.
- Ask **who needs the route** before protecting it: catalog routes are public.
- Test users per role: [`backend/src/fixtures/README.md`](../backend/src/fixtures/README.md) (password `Password123`).

## Plan

The developer learned JWT and middlewares while building it, following the [teaching loop](../AGENTS.md#teaching-loop).

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | `JWT_SECRET` and `JWT_EXPIRES_IN` in `docker-compose.yml`, `backend/.env.example` and `backend/README.md` | — | ✅ |
| 1 | Install `jsonwebtoken` and `bcryptjs`; stop the server at startup if `JWT_SECRET` is missing | Server stops with a clear message when it is removed from **both** env sources | ✅ |
| 2 | `models/Usuario.js` (`passwordHash` with `select: false`) | `trim`, `lowercase`, `enum` validations | ✅ |
| 3 | `POST /api/auth/register`: always creates `CLIENTE`, hashes the password | Hash in Compass; duplicate email `409`; `"rol":"ADMIN"` still creates `CLIENTE` | ✅ |
| 4 | `POST /api/auth/login`: JWT with `_id` and `rol` | Wrong email or password → same `401`; missing fields → `400` | ✅ |
| 5 | `middlewares/auth.middleware.js` + `GET /api/auth/me` | No token, tampered or expired token → `401` | ✅ |
| 5b | Fixtures: `backend/src/fixtures/` + `make seed` | Admin can log in after `make seed` | ✅ |
| 6 | `middlewares/role.middleware.js`; `POST /api/tipo-propiedades` only for `ADMIN` | `CLIENTE` → `403`; `ADMIN` → `201` | ✅ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Creates a `CLIENTE` (`201`); duplicate email `409`; password < 8 chars `400` |
| `POST` | `/api/auth/login` | Public | `{ token, usuario }` (`200`); wrong credentials or inactive user `401`; missing fields `400` |
| `GET` | `/api/auth/me` | Any logged-in user | Current user (`200`); no/invalid/expired token `401` |

## Decisions

- Clients self-register from `/registro`; `ADMIN`, `EJECUTIVO` and `PROPIETARIO` accounts are created by an admin. *(pending professor validation)*
- The first `ADMIN` is created by the fixtures, since nobody can register as admin.
- Registration creates only the `usuarios` document for now. Linking the `clientes` record (`clienteId`) comes with the `Cliente` model.
- Password confirmation is validated **only in the frontend**; the API receives a single `password` (it is also used by admins and fixtures).
- `GET /api/tipo-propiedades` stays public: visitors filter the catalog by type (RF5).
- Known limitation: the `rol` inside a token does not change until it expires (24 h). Acceptable for the project.
- Security rules: [`AGENTS.md → Security and authentication`](../AGENTS.md#security-and-authentication).

## Coordination with other models

- **`clientes` (Jose):** public registration should also create the `clientes` record and save its `_id` in `usuarios.clienteId`. This touches `auth.controller.js`, so Jose must agree it with Deyby first.
- **`propietarios` (Santiago):** a `PROPIETARIO` user is linked with `usuarios.propietarioId`. Creating those users belongs to `/api/usuarios` (follow-up 4 below).

## Pending follow-ups

1. Complete client registration with `clienteId` (needs the `Cliente` model, see above).
2. Validate the email format in the `Usuario` model.
3. Shared Postman collection in the repo, with a variable that stores the token after login.
4. `/api/usuarios` for the admin to create executives and owners and to deactivate users.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-10-31 | Planned auth; created the branch; JWT variables in Docker and docs. | Step 1 next. |
| 2026-11-01 | Steps 1–5 built by the developer with guidance; fixtures created by the agent on request. | Step 6 next. |
| 2026-11-01 | Step 6: `permitirRoles`; `POST /api/tipo-propiedades` restricted to `ADMIN`. | PR #20 merged into `development`. |
