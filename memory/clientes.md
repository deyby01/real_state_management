# clientes — Cliente

> **Owner:** Jose · **Branch:** `feature/jose/clientes` · **Status:** 🚧 In progress
> **Specification:** [`docs/DATA_MODEL.md → clientes`](../docs/DATA_MODEL.md#clientes-interested-clients-and-tenants)
> **Depends on:** `usuarios` (✅ merged, linked through `usuarios.clienteId`) · **Used by:** `visitas`, `solicitudesArriendo`

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | 🚧 |
| 1 | Model `backend/src/models/Cliente.js` | Fields, validations and unique indexes visible in Compass | ⬜ |
| 2 | Controller: list and get by id | `200`, `404` | ⬜ |
| 3 | Controller: create and update (with business rules) | `201`, `400`, `409` | ⬜ |
| 4 | Controller: soft delete (`activo: false`) | Record still in Compass with `activo: false` | ⬜ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ⬜ |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads the data | ⬜ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases | ⬜ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| — | — | — | — |

## Decisions

- `rut` is stored normalized without dots (`12345678-9`) — matches `propietarios` and keeps the unique index reliable.
- `rut` and `email` each get their own unique index (not a compound one): RN-11 forbids the same client twice by **either** identifier, so each must be unique on its own.
- `estado` defaults to `INTERESADO`; it moves to `ARRENDATARIO` when the client signs a rental contract (later model).
- Duplicate key (`11000`) responds `409`, following `tipoPropiedad.controller.js`.
- Who creates the client record (executive from the admin panel vs. public registration) — *(pending professor validation; affects the controller and `auth.controller.js`)*
- Is `telefono` required? The model docs mark it optional, but RN-11 mentions phone as a duplicate signal. Proposal: keep it optional in the schema and do not treat it as a unique key for now. *(pending professor validation)*

## Coordination with other models

- **`usuarios` (Deyby):** public registration should also create the `clientes` record and store its `_id` in `usuarios.clienteId`. This modifies `auth.controller.js`, so it must be agreed with Deyby **before** touching that file (see [`memory/usuarios.md`](usuarios.md)).
- **`visitas` / `solicitudesArriendo`:** both will reference `clientes` through `clienteId` (`ObjectId` + `ref: "Cliente"`). No action needed from us beyond exposing list/get by id.

## Proposals for AGENTS.md

- —

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-03 | Read `AGENTS.md`, `MEMORY.md` and the reference flows; verified the branch is up to date with `origin/development`; created this memory file. | Step 0 done; step 1 (`models/Cliente.js`) next. |
