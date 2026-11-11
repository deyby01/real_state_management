# clientes — Cliente

> **Owner:** Jose · **Branch:** `feature/jose/clientes` · **Status:** 🚧 In review — steps 0–8 done (step 8 = English JSDoc, new rule 12), Pull Request [#25](https://github.com/deyby01/real_state_management/pull/25) open and up to date with `development`, waiting for the integrator to merge
> **Specification:** [`docs/DATA_MODEL.md → clientes`](../docs/DATA_MODEL.md#clientes-interested-clients-and-tenants)
> **Depends on:** `usuarios` (✅ merged, linked through `usuarios.clienteId`) · **Used by:** `visitas`, `solicitudesArriendo`

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | ✅ |
| 1 | Model `backend/src/models/Cliente.js` | Fields, validations and unique indexes visible in Compass | ✅ |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create and update (with business rules) | `201`, `400`, `409` | ✅ |
| 4 | Controller: soft delete (`activo: false`) | Record still in Compass with `activo: false` | ✅ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ✅ |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads the data | ✅ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases | ✅ PR [#25](https://github.com/deyby01/real_state_management/pull/25) open |
| 8 | Code documentation: English JSDoc in `models/Cliente.js`, `routes/cliente.routes.js` and the five controller functions (AGENTS.md rule 12) | — | ✅ documented; 22/22 runtime checks passed after merging `development` |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/clientes` | `ADMIN`, `EJECUTIVO` | Active clients (`200`); no token `401`; other role `403` |
| `GET` | `/api/clientes/:id` | `ADMIN`, `EJECUTIVO` | Client (`200`); invalid id `400`; not found `404`; no token `401`; other role `403` |
| `POST` | `/api/clientes` | `ADMIN`, `EJECUTIVO` | Created (`201`); invalid data `400`; duplicate `409`; no token `401`; other role `403` |
| `PUT` | `/api/clientes/:id` | `ADMIN`, `EJECUTIVO` | Updated (`200`); invalid data `400`; not found `404`; duplicate `409`; no token `401`; other role `403` |
| `DELETE` | `/api/clientes/:id` | **`ADMIN` only** | Soft-deleted (`200`); invalid id `400`; not found `404`; no token `401`; `EJECUTIVO` → `403` |

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
- All routes are protected with `verificarToken` + `permitirRoles`. `GET`, `POST` and `PUT` allow `ADMIN` and `EJECUTIVO`; **`DELETE` allows `ADMIN` only**, because deactivating a client is more sensitive than editing it. Public users (`CLIENTE`, `PROPIETARIO`) get `403`: the client portfolio is internal data. The middlewares already existed (`usuarios`, PR #20) and are only imported, never rewritten.
- Middleware order is `verificarToken` **then** `permitirRoles`: the role middleware reads `req.usuario`, which only exists after the token is verified. Reversing them would throw a `TypeError` and answer `500`.
- `401` vs `403`: `401` means the token is missing, malformed or expired; `403` means the token is valid but the role is not allowed.
- Fixtures: 3 clients (`data/clientes.js`) — Ana Pérez (`cliente@gup.cl`, the same person as the `CLIENTE` user, same email so the future link is trivial), Luis Soto (registered by an executive, phone only, no account) and Camila Rivas (`ARRENDATARIO`, to cover the second enum value). RUTs are written already normalized (hyphen, no dots) because `insertMany` bypasses the controller normalization. `activo` is omitted on purpose so the schema default applies.
- `usuarios.clienteId` is **not** filled by the fixtures: that field belongs to `usuarios` (Deyby) and filling it means updating the `CLIENTE` user; it stays `null` until it is agreed (see *Coordination with other models*). Nothing is blocked because the field has `default: null`.
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
| `DELETE /api/clientes/6aed46cc682ed1bedb78fa29` | `200` with `activo: false`; document still in the collection |
| `GET /api/clientes` after the delete | the inactive client disappears (only active ones are listed) |
| `GET /api/clientes/:id` of the inactive client | `200`, still returned by the detail |
| repeated `DELETE` | `200` (idempotent) |
| `DELETE /api/clientes/abc` | `400 ID de cliente inválido` |
| `DELETE /api/clientes/65f000000000000000000000` | `404 Cliente no encontrado` |
| `GET /api/clientes` without token | `401 Token no proporcionado` |
| `POST` and `DELETE` without token | `401` |
| `GET` with a `CLIENTE` token | `403 No tienes permiso para realizar esta acción` |
| `GET` with an `EJECUTIVO` token | `200` |
| `GET` with an `ADMIN` token | `200` |
| `GET` with a garbage token (`abc123`) | `401 Token inválido o expirado` (`jwt malformed`) |
| `DELETE` with an `EJECUTIVO` token | `403` (same user passes `GET` with `200`) |
| `make seed` | `Tipos de propiedad: 4`, `Usuarios: 5`, `Clientes: 3`, accents and `ñ` preserved, RUTs with hyphen |

### Full pass (2026-11-09, run by the agent against the live backend)

28 requests, all with the expected code: 6 auth/role cases, 5 `POST` (`201`, `409` ×2, `400` ×2), 3 `GET` (`200`, `400`, `404`), 7 `PUT` (`200` ×3, `400`, `409`, `404`), 7 `DELETE` (`200` ×2, `403`, `400`, `404`) plus the list/detail checks. Evidence highlights:

- `POST` with `rut: "19.876.543-2"` and `email: "TEMPORAL@MAIL.CL"` stored `19876543-2` / `temporal@mail.cl`, with `estado: INTERESADO` and `activo: true` by default.
- `PUT { "activo": false }` on an active client answered `200` and the document kept `activo: true` (whitelist verified at runtime, not only by reading the code).
- After the `DELETE`, the list returned 3 active clients out of 4 documents, and the detail still returned the inactive one.
- Bug found and fixed in this pass: the `500` handler used `error.mensaje` instead of `error.message`, so the response silently lost the cause (`JSON.stringify` drops `undefined`). The `400` of `DELETE` also answered `"ID de cliente invalido"` without the accent used by `GET` and `PUT`. Both were corrected.

Visual evidence: eight Postman screenshots (A–H) attached as a comment in Pull Request #25 — create `201`, duplicate `409`, validation `400`, no token `401`, `CLIENTE` `403`, `DELETE` with `EJECUTIVO` `403`, `DELETE` with `ADMIN` `200` and the list hiding the inactive client.

### Post-merge smoke test (2026-11-10, after merging `development`)

22 requests against the live backend after `make seed`, all with the expected code: `401` (no token and garbage token), `403` (`CLIENTE` on the list, `EJECUTIVO` on `DELETE`), `200` (list with `ADMIN` and `EJECUTIVO`), `201` with RUT normalization (`20.111.222-3` → `20111222-3`) and email lowercased **even when the body sent `activo: false`** (whitelist verified at runtime again), `409` naming `rut` and `email`, `400` (missing `nombre`, lowercase `estado`, invalid id), `404` (unknown id), `200` on soft delete, the inactive client no longer listed but still returned by the detail, and the repeated `DELETE` still `200`. The database was reseeded afterwards (3 active clients, 0 inactive).

## Coordination with other models

- **`usuarios` (Deyby):** public registration should also create the `clientes` record and store its `_id` in `usuarios.clienteId`. This modifies `auth.controller.js`, so it must be agreed with Deyby **before** touching that file (see [`memory/usuarios.md`](usuarios.md)).
- **`visitas` / `solicitudesArriendo`:** both will reference `clientes` through `clienteId` (`ObjectId` + `ref: "Cliente"`). No action needed from us beyond exposing list/get by id.
- **Fixtures (step 6, ✅ done):** `data/clientes.js` is inserted **after** `usuarios` in `seed.js`, which also runs `Cliente.deleteMany({})` before `insertMany`. The fixtures do **not** fill `usuarios.clienteId`: doing so means updating the `CLIENTE` user, which belongs to the `usuarios` owner. It stays `null` (`default: null`) until Deyby agrees on the linking rule; the client fixture uses `cliente@gup.cl`, the same email as the `CLIENTE` user, so the link is a one-line `updateOne` when that is decided.
- **Pull Request #24 (`solicitudesArriendo`, Roberto):** reviewed with *changes requested*. It still loads the client model lazily with `mongoose.model("Cliente")` because this model was not merged yet; once this PR lands, that call resolves, and he should switch to a normal `import` (the same change he was asked to make for `Propiedad`). It also adds `fixtures/data/solicitudesArriendo.js` without wiring it in `seed.js`, so `make seed` would not load those documents: integrator note, his file.
- **`development` merged into this branch on 2026-11-10:** merge commit `3c24cd7` plus the fix `4539c3c`. They bring the `Propiedad` model (PR #28) and the JSDoc documentation pass (PR #30). The conflict in `backend/src/app.js` was resolved by **keeping both routers**; the teammate's line is never removed.

## Proposals for AGENTS.md

- **Environment lesson:** when `make up` / `make seed` fail with `failed to connect to the docker API ... dockerDesktopLinuxEngine` or `service "backend" is not running`, the cause is usually that **Docker Desktop is not running**, not a project error. On this machine it is installed per-user at `%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe` (not in `Program Files`). Open it, wait for *Engine running*, then retry.
- **Environment lesson (2026-11-06):** if the backend logs end with `Error: Cannot find module '/app/src/index.js'` (and sometimes `.env not found`), the container was started while the bind mount was not ready — usually because the stack was recreated right after Docker Desktop started, or the containers were down. Check `docker compose ps` first; if it is empty, `make up` recreates the containers and the folder is mounted again. Saving a file does not fix it.
- **Code review lesson:** in a controller with a field whitelist, the destructuring **must list exactly the fields passed to `create()` / `findByIdAndUpdate()`**. A missing name is not `undefined`: it throws `ReferenceError`, which the `catch` turns into a misleading `500` on every request. Review both lists side by side.
- **Agent mistake (2026-11-04):** I used `try { ... }` as an expression inside a PowerShell string concatenation; PowerShell 5.1 does not allow that and every request failed. Lesson: in `shell` commands, use a function or explicit `if`/`$LASTEXITCODE` instead of `try` as an expression.
- **JavaScript lesson (2026-11-09):** `${...}` interpolation only works inside **backticks** (`template literals`). With single or double quotes the value is printed literally (`Clientes: ${clientes.length}`). Whenever a `console.log` shows the placeholder instead of the number, the quotes are the cause.
- **Code review lesson (2026-11-09):** the property of an `Error` is `error.message`, not `error.mensaje`. With the wrong name the value is `undefined` and `JSON.stringify` **drops the key**, so a `500` answers without its cause and the bug stays hidden until something really fails. Every `catch` that answers `500` deserves a second read.
- **Process lesson (2026-11-09):** `deleteCliente` went inside the commit *"protect client routes by role"* and the `error.message` fix inside *"add client fixtures"*. One commit per unit of work (feat, fix, docs) keeps the history readable and the PR reviewable. History already pushed is never rewritten with `amend` or `push --force`; the lesson is for the next step.
- **Testing lesson (2026-11-09):** a "request without token" that answers `403` is not a backend bug: it means a token was actually sent. Postman keeps the Authorization tab per request and can inherit it from the folder or the collection; the header can also be hidden behind the *hidden* counter in the Headers tab. Verify what the client really sends before touching the code.
- **Git lesson (2026-11-10):** the merge commit `3c24cd7` was committed **with the conflict markers still inside `app.js`** (`<<<<<<< HEAD`, `=======`, `>>>>>>>`), so that commit does not compile; the next commit removed them. Before committing a merge: resolve the file, `git add` it, then check `git diff --check` and search for `<<<<<<<`. A merge commit must build.
- **Commit message lesson (2026-11-10):** `fix: resuelvo conflicto de merge en app.js` is Spanish and first person. Messages follow Conventional Commits in English and imperative: `fix: keep both routers when merging development`.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-03 | Read `AGENTS.md`, `MEMORY.md` and the reference flows; verified the branch is up to date with `origin/development`; created this memory file. | Step 0 done; step 1 (`models/Cliente.js`) next. |
| 2026-11-04 | Step 1: `models/Cliente.js` written by the developer and reviewed (fixed `estado` enum to `INTERESADO`/`ARRENDATARIO`). Step 2: `cliente.controller.js` + `cliente.routes.js` + mounting in `app.js`, reviewed with `node --check` and tested live: `GET /api/clientes` `200 []`, invalid id `400`, missing id `404`. Compass shows `clientes` with `rut_1` and `email_1` unique. Committed `31cc145 feat: add client list and detail endpoints` and pushed. Docker Desktop had to be started manually before `make up` / `make seed`. | Next: step 3, `POST /api/clientes` (RUT normalization, whitelist, `409` per duplicated field). |
| 2026-11-05 | Step 3a: `normalizarRut` + `postCliente` written by the developer and reviewed. Fixed three issues: the helper was removing the hyphen (now only dots/spaces), the whitelist was missing `comuna` (caused `ReferenceError` → `500`), and duplicates answered `400` instead of `409`. Tested live: `201` with normalized `rut` and lowercased `email`, `409` for RUT and email, `400` for missing fields and for the lowercase `estado`; MongoDB ends with exactly one document. Committed `e447a87 feat: add client create endpoint`. | Next: `PUT` (step 3b). |
| 2026-11-06 | Step 3b: `putCliente` + route written by the developer and reviewed; verified `new: true` and `runValidators: true` are required. Tested live: `200` updating `comuna`, `400` for `estado: "arrendatario"`, `200` for `{ "activo": false }` with the document still active, `409` for a duplicate email, `400` for `abc`, `404` for a valid unknown id. Committed `f05526f feat: add client update endpoint`. Also diagnosed a backend crash: containers were down, `make up` recreated them and the bind mount returned. | Next: step 4, soft delete with `activo: false`. |
| 2026-11-09 | Steps 4–6. **Step 4:** `deleteCliente` + route written and tested (`200`, list hides the inactive client, detail still shows it, repeated `DELETE` `200`, `400`, `404`). **Step 5:** `verificarToken` + `permitirRoles` on the five routes, `DELETE` restricted to `ADMIN`; the first attempt answered `403` because Postman kept a token in the Authorization tab, not because of the code — after removing it: `401` without token, `403` with `CLIENTE`, `200` with `ADMIN`/`EJECUTIVO`, `403` for `DELETE` with `EJECUTIVO`. **Step 6:** `data/clientes.js` (3 clients), `seed.js` (`deleteMany` + `insertMany` after `usuarios`) and the fixtures README row; fixed the log message that used quotes instead of backticks. **Step 7 (in progress):** full pass of 28 requests run by the agent, all with the expected code; found and fixed `error.mensaje` → `error.message` in the `500` handler and the accent of the `DELETE` `400` message. Commits `2e52764 feat: protect client routes by role` and `d09db62 feat: add client fixtures` (both mixed several steps). | Next: update this file, draft the PR description from `.github/pull_request_template.md` and open the Pull Request. |
| 2026-11-09 | **Step 7 closed.** `memory/clientes.md` updated with steps 4–6 and committed (`c7883c9 docs: update clientes memory with steps 4-6`); cosmetic fix committed (`15c189a style: fix spacing in the client delete error response`). Branch rebased/up to date with `origin/development` (`0923ba8`) and pushed. Pull Request **#25** opened from `feature/jose/clientes` into `development` with the template description and eight Postman screenshots (A–H) in a comment; GitHub reports no conflicts at opening time. Local database left clean with `make seed` (3 clients). | Waiting for the integrator (Deyby) to review and merge; then pull `development`, `make seed` and verify `GET /api/clientes`. A Word study guide for the presentation was also generated outside the repository. |
| 2026-11-09 | Presentation support: a 17-page Word document (`Modelo_Clientes_GUP.docx`, on the Desktop, not in the repository) explaining the model, the concepts, the decisions, the test evidence, a 10-minute demo script and the likely professor questions. | Used to prepare the oral defence of the model; the repository and PR #25 were not modified. |
| 2026-11-10 | Merged `development` (`91b3cee`: `Propiedad` PR #28 and the JSDoc pass PR #30) into the branch; conflict in `app.js` resolved keeping both routers. Local `development` updated; the branch contains all of `origin/development`, PR #25 head `4539c3c`, nothing pending to merge. The merge commit went out with the conflict markers and the next commit removed them (lesson recorded). | Live check done after the documentation step: 22/22 requests with the expected code; database reseeded. |
| 2026-11-10 | Step 8 (new AGENTS.md rule 12): English JSDoc for the model header, the router and the five exported controller functions; the Spanish comments that only described *what* were replaced by English comments that explain *why*. Only comments and whitespace changed (`node --check` passes on the three files). Smoke test against the live backend: 22 requests, all with the expected code. | Next: commit `docs: document client flow with JSDoc` together with this memory update; then the optional `refactor: use returnDocument after` (`new: true` is deprecated in Mongoose 9). |
