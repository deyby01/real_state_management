# tiposPropiedad — TipoPropiedad

> **Owner:** Deyby · **Status:** ✅ Merged (PR #19); `POST` protected for `ADMIN` in PR #20
> **Specification:** [`docs/DATA_MODEL.md → tiposPropiedad`](../docs/DATA_MODEL.md#tipospropiedad-property-types)
> **Depends on:** — · **Used by:** `propiedades` (`tipoId`)

## Why it matters to the team

This is the **reference implementation** of the MVC flow: every new model copies its structure (see [`AGENTS.md → Backend structure`](../AGENTS.md#backend-structure-mvc)).

| Layer | File |
|---|---|
| Model | `backend/src/models/TipoPropiedad.js` |
| Controller | `backend/src/controllers/tipoPropiedad.controller.js` |
| Routes | `backend/src/routes/tipoPropiedad.routes.js` |
| Mounting | `app.use("/api/tipo-propiedades", tipoRouter)` in `backend/src/app.js` |
| Fixtures | `backend/src/fixtures/data/tiposPropiedad.js` (4 types) |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/tipo-propiedades` | Public (catalog filter, RF5) | Active types (`200`) |
| `POST` | `/api/tipo-propiedades` | `ADMIN` | `201`; no token `401`; other role `403`; duplicate `409` |

## Pending

- Update and soft delete (`activo: false`) are not implemented yet. Only add them if the professor or another model needs them.
