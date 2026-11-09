# clientes — Cliente

> **Owner:** Jose · **Branch:** `feature/jose/clientes` · **Status:** 🚧 In progress (steps 0–3 done, step 4 next)
> **Specification:** [`docs/DATA_MODEL.md → clientes`](../docs/DATA_MODEL.md#clientes-interested-clients-and-tenants)
> **Depends on:** `usuarios` (✅ merged, linked through `usuarios.clienteId`) · **Used by:** `visitas`, `solicitudesArriendo`

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | ✅ |
| 1 | Model `backend/src/models/Cliente.js` | Fields, validations and unique indexes visible in Compass | ✅ |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create and update (with business rules) | `201`, `400`, `409` | ✅ |
| 4 | Controller: soft delete (`activo: false`) | Record still in Compass with `activo: false` | ⬜ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ⬜ |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads the data | ⬜ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases | ⬜ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/clientes` | Public **for now** (protection in step 5) | Active clients (`200`) |
| `GET` | `/api/clientes/:id` | Public **for now** (protection in step 5) | Client (`200`); invalid id `400`; not found `404` |
| `POST` | `/api/clientes` | Public **for now** (protection in step 5) | Created (`201`); invalid data `400`; duplicate `409` |
| `PUT` | `/api/clientes/:id` | Public **for now** (protection in step 5) | Updated (`200`); invalid data `400`; not found `404`; duplicate `409` |
| `DELETE` | `/api/clientes/:id` | Public **for now** (protection in step 5) — *step 4, in progress* | Soft-deleted (`200`); invalid id `400`; not found `404` |

## Decisions

- `rut` is stored normalized without dots (`12345678-9`): the normalization (remove dots/spaces, `k` → `K`) lives in the **controller**, not in the schema, because the unique index compares exact text. The **hyphen is kept**, as in `propietarios` and `docs/DATA_MODEL.md`; removing it would leave `123456789` and break consistency with the other models.
- `rut` and `email` each get their own unique index (not a compound one): RN-11 forbids the same client twice by **either** identifier, so each must be unique on its own. Verified in Compass: `rut_1` and `email_1`, both `unique: true`.
- `estado` defaults to `INTERESADO`; it moves to `ARRENDATARIO` when the client signs a rental contract (later model).
- Duplicate key (`11000`) responds `409`, telling **which** field collided (`error.keyValue`) because there are two unique indexes.
- `ValidationError` responds `400` (missing `required` or `enum` mismatch); `CastError` responds `400` (malformed `_id`); unexpected errors respond `500`.
- The create endpoint uses a **field whitelist** (destructuring), never `Cliente.create(req.body)`, so `activo`, `_id` or `createdAt` cannot be injected from the body.
- The list shows only `activo: true` (same as `TipoPropiedad`); the detail **does** return an inactive client if its id is known (useful for an admin review).
- `PUT` reuses the same whitelist and **also excludes `activo`**, so the only way to deactivate a client is `DELETE` (soft delete). Verified: `PUT { "activo": false }` responds `200` but the document keeps `activo: true`.
- `PUT` may change `rut` (a mistyped RUT is a real case), normalized with the same helper; the field is only sent to the update when it appears in the body (`rut !== undefined`), so a partial update does not erase it.
- `PUT` uses `findByIdAndUpdate` with `new: true` (returns the updated document) and `runValidators: true` (without it Mongoose skips the `enum` on updates and would store `"arrendatario"`).
- Soft delete is `findByIdAndUpdate(id, { activo: false }, { new: true })`: one query, `null` → `404`. It is idempotent (a second `DELETE` still returns `200`), needs no `runValidators` (only a boolean changes) and no `11000` handling (no unique field is touched).
- Routes are intentionally unprotected until step 5. Proposal for that step: `verificarToken` + `permitirRoles("ADMIN", "EJECUTIVO")`.
- Who creates the client record (executive from the admin panel vs. public registration) — *(pending professor validation; affects the controller and `auth.controller.js`)*
- Is `telefono` required? The model docs mark it optional, but RN-11 mentions phone as a duplicate signal. Proposal: keep it optional in the schema and do not treat it as a unique key for now. *(pending professor validation)*

## Test evidence

| Endpoint | Verified result |
|---|---|
| `GET /api/clientes` | `200 []`; after seeding data, only active clients |
| `GET /api/clientes/abc` | `400 ID de cliente inválido` |
| `GET /api/clientes/65f000000000000000000000` | `404 Cliente no encontrado` |
| `POST` valid body | `201`, `rut: "12345678-9"`, `email` lowercased, `estado: INTERESADO`, `activo: true` |
| `POST` repeated RUT / email | `409` naming the collided field |
| `POST` missing `rut`/`nombre` | `400 Datos inválidos: rut, nombre` |
| `POST` `estado: "arrendatario"` | `400 Datos inválidos: estado` |
| `PUT` `{ "comuna": "Las Condes" }` | `200`, updated document returned, `rut`/`email` intact |
| `PUT` `{ "estado": "arrendatario" }` | `400` (proves `runValidators`) |
| `PUT` `{ "activo": false }` | `200`, document still `activo: true` (proves whitelist) |
| `PUT` duplicate email | `409` |
| `PUT /api/clientes/abc` | `400` |
| `PUT /api/clientes/65f000000000000000000000` | `404` |

## Coordination with other models

- **`usuarios` (Deyby):** public registration should also create the `clientes` record and store its `_id` in `usuarios.clienteId`. This modifies `auth.controller.js`, so it must be agreed with Deyby **before** touching that file (see [`memory/usuarios.md`](usuarios.md)).
- **`visitas` / `solicitudesArriendo`:** both will reference `clientes` through `clienteId` (`ObjectId` + `ref: "Cliente"`). No action needed from us beyond exposing list/get by id.
- **Fixtures (step 6):** the client data file must be inserted **after** `usuarios` in `seed.js`, and `seed.js` must add `Cliente.deleteMany({})` before `insertMany`.

## Proposals for AGENTS.md

- **Environment lesson:** when `make up` / `make seed` fail with `failed to connect to the docker API ... dockerDesktopLinuxEngine` or `service "backend" is not running`, the cause is usually that **Docker Desktop is not running**, not a project error. On this machine it is installed per-user at `%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe` (not in `Program Files`). Open it, wait for *Engine running*, then retry.
- **Environment lesson (2026-11-06):** if the backend logs end with `Error: Cannot find module '/app/src/index.js'` (and sometimes `.env not found`), the container was started while the bind mount was not ready — usually because the stack was recreated right after Docker Desktop started, or the containers were down. Check `docker compose ps` first; if it is empty, `make up` recreates the containers and the folder is mounted again. Saving a file does not fix it.
- **Code review lesson:** in a controller with a field whitelist, the destructuring **must list exactly the fields passed to `create()` / `findByIdAndUpdate()`**. A missing name is not `undefined`: it throws `ReferenceError`, which the `catch` turns into a misleading `500` on every request. Review both lists side by side.
- **Agent mistake (2026-11-04):** I used `try { ... }` as an expression inside a PowerShell string concatenation; PowerShell 5.1 does not allow that and every request failed. Lesson: in `shell` commands, use a function or explicit `if`/`$LASTEXITCODE` instead of `try` as an expression.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-03 | Read `AGENTS.md`, `MEMORY.md` and the reference flows; verified the branch is up to date with `origin/development`; created this memory file. | Step 0 done; step 1 (`models/Cliente.js`) next. |
| 2026-11-04 | Step 1: `models/Cliente.js` written by the developer and reviewed (fixed `estado` enum to `INTERESADO`/`ARRENDATARIO`). Step 2: `cliente.controller.js` + `cliente.routes.js` + mounting in `app.js`, reviewed with `node --check` and tested live: `GET /api/clientes` `200 []`, invalid id `400`, missing id `404`. Compass shows `clientes` with `rut_1` and `email_1` unique. Committed `31cc145 feat: add client list and detail endpoints` and pushed. Docker Desktop had to be started manually before `make up` / `make seed`. | Next: step 3, `POST /api/clientes` (RUT normalization, whitelist, `409` per duplicated field). |
| 2026-11-05 | Step 3a: `normalizarRut` + `postCliente` written by the developer and reviewed. Fixed three issues: the helper was removing the hyphen (now only dots/spaces), the whitelist was missing `comuna` (caused `ReferenceError` → `500`), and duplicates answered `400` instead of `409`. Tested live: `201` with normalized `rut` and lowercased `email`, `409` for RUT and email, `400` for missing fields and for the lowercase `estado`; MongoDB ends with exactly one document. Committed `e447a87 feat: add client create endpoint`. | Next: `PUT` (step 3b). |
| 2026-11-06 | Step 3b: `putCliente` + route written by the developer and reviewed; verified `new: true` and `runValidators: true` are required. Tested live: `200` updating `comuna`, `400` for `estado: "arrendatario"`, `200` for `{ "activo": false }` with the document still active, `409` for a duplicate email, `400` for `abc`, `404` for a valid unknown id. Committed `f05526f feat: add client update endpoint`. Also diagnosed a backend crash: containers were down, `make up` recreated them and the bind mount returned. | Next: step 4, soft delete with `activo: false`. |
