# visitas — Visita

> **Owner:** Ignacio · **Branch:** `feature/ignacio/visitas` · **Status:** ✅ Model complete — PR text ready; Postman screenshots and GitHub PR opening pending (2026-11-13)  
> **Specification:** [`docs/DATA_MODEL.md → visitas`](../docs/DATA_MODEL.md#visitas-visit-requests)  
> **Depends on:** `propiedades` (Deyby, merged ✅ PR #28 + fixtures PR #33), `clientes` (Jose, merged ✅ PR #25), `usuarios` (merged ✅, linked to `clientes` and `propietarios` by PR #33); writes to `bitacora` (merged ✅)  
> **Used by:** — (nothing references `visitas` yet; it feeds the visit reports, RF12)

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read DATA_MODEL, state machine, overlap rule and libraries | — | ✅ |
| 1 | Model `backend/src/models/Visita.js` | Fields, validations, future date check, compound index visible in Compass | ✅ |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create, modify date and state transitions (business rules + bitacora) | `201`, `400`, `409` | ✅ (POST with RN-16/D10, `PUT` reschedule and the four PATCH transitions) |
| 4 | Soft delete | — | N/A: visits are voided with CANCELADA; DATA_MODEL has no activo |
| 5 | Routes + mounting in `app.js` + role protection | No token `401`, wrong role `403` | ✅ (mounted in Step 2; matrix closed in step 5: `EJECUTIVO` only, `ADMIN` 403, `CLIENTE` deferred) |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads 6 visits when guard passes (2 `PUBLICADA` + current executive + ≥2 clients); else omitidas | ✅ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases (`400`, `401`, `403`, `409`) | ✅ 103/103 on rebased branch; ⬜ open PR + attach screenshots |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/visitas?estado=&propiedadId=&ejecutivoId=&desde=&hasta=` | `EJECUTIVO` | `200`, `400`, `401`, `403` |
| `GET` | `/api/visitas/:id` | `EJECUTIVO` | `200`, `400`, `401`, `403`, `404` |
| `POST` | `/api/visitas` | `EJECUTIVO` (`CLIENTE`* once linked) | `201`, `400`, `401`, `403`, `409` |
| `PUT` | `/api/visitas/:id` | `EJECUTIVO` (reschedule dates while `SOLICITADA` or `CONFIRMADA`) | `200`, `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/confirmar` | `EJECUTIVO` | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/rechazar` | `EJECUTIVO` | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/cancelar` | `EJECUTIVO` (`CLIENTE`* own visit once linked) | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/resultado` | `EJECUTIVO` | `200`, `400`, `401`, `403`, `404`, `409` |

> `*`: `CLIENTE` endpoints are deferred to a follow-up PR (CU6: request and cancel own visits). The `usuarios.clienteId` link already exists (PR #33), so that PR only needs the session-based `clienteId`, the ownership check and the `populate("clienteId")`.
> `ADMIN` has no access to any visit route: per the case, its visit use case is CU10 (reports), through `/api/reportes/visitas`, which is not implemented yet.

## Decisions

- **Fixed 1-hour duration (D8):** `fechaFin` is automatically calculated as `fechaInicio` + 60 minutes.
- **Executive copy (D10):** `ejecutivoId` is copied from the property assigned to the visit; the client does not choose it.
- **Own collection:** Visits are queried by executive (agenda, overlap check) and by client ("my visits"), not only by property.
- **State machine (DATA_MODEL 6.3):**
  - `SOLICITADA → CONFIRMADA | RECHAZADA | CANCELADA`
  - `CONFIRMADA → REALIZADA | CANCELADA`
  - `REALIZADA`, `RECHAZADA`, and `CANCELADA` are final states.
  - Any invalid transition responds with `409 Conflict`.
- **"Modify" is not a state:** `PUT` updates `fechaInicio` and `fechaFin` only if state is `SOLICITADA` or `CONFIRMADA`, re-evaluating the overlap rule.
- **`resultado` is not a state:** Registering the result updates the `resultado` text and transitions `CONFIRMADA → REALIZADA`.
- **Overlap check (RN-10):** Same `ejecutivoId`, state not in `["CANCELADA", "RECHAZADA"]`, with time overlap condition: `fechaInicio < newFechaFin && fechaFin > newFechaInicio` → `409 Conflict`.
- **Compound index:** `{ ejecutivoId: 1, fechaInicio: 1, fechaFin: 1 }` to support fast agenda queries and overlap checks.
- **`fechaInicio` must be in the future:** Validated on creation and date rescheduling.
- **Visits only on `PUBLICADA` properties (RN-16):** the property is read with `findOne({ _id, activo: true })` before the overlap check. Missing or soft-deleted → `400`; exists but not `PUBLICADA` → `409` with `estadoActual`.
- **No `DELETE` and no `activo` field:** `visitas` does not have an `activo` field in `DATA_MODEL.md`. A visit is voided using the `CANCELADA` status. *(pending professor validation)*
- **Role matrix (step 5, closed):** every visit route requires `EJECUTIVO`. The case assigns CU6 (request a visit) to `CLIENTE` and CU7 (manage visits) to `EJECUTIVO`; `ADMIN` only has CU10 (reports), so it gets `403` on visits and will read them through `/reportes/visitas` (not implemented yet). The endpoint table in the case also lists visits as "Cliente / Ejecutivo", never Admin.
- **Bridge for creation (CU6 deferred):** `POST /visitas` stays `EJECUTIVO` while the follow-up PR adds session-based `clienteId` for `CLIENTE` (account link exists since PR #33). `EJECUTIVO` remains for visits requested by phone *(pending professor validation)*.
- **Cross-executive management (Decision A):** any `EJECUTIVO` can see and modify any visit; per-owner restrictions were rejected for now, consistent with `propiedades` (all executives manage all properties) and with the demo requirement.
- **Automatic calculation of `fechaFin` (D8):** Computed via a Mongoose `pre("validate")` hook (`fechaFin = fechaInicio + 1 hour`). Guarantees duration consistency across controllers, fixtures, and scripts.
- **Document pattern for updates:** Rescheduling (`PUT`) must use `doc = await Visita.findById(); doc.fechaInicio = ...; await doc.save()`. This ensures both the future date validator and the `pre("validate")` hook execute properly without query-context issues (`TypeError: this.isModified`).
- **Executive visibility (Decision A):** any `EJECUTIVO` sees every visit by default; filter with `?ejecutivoId=`. `ADMIN` is not allowed on `/api/visitas` (step 5).
- **Supported filters for listing (Decision B):** `GET /api/visitas` supports filtering by `estado` (validated against `ESTADOS_VISITA`), `propiedadId`, `ejecutivoId`, and date range (`desde` and `hasta` with `$gte` and `$lte`). Invalid query params return `400 Bad Request`.
- **Early route mounting (Decision C1):** `visitaRouter` mounted in `app.js` during Step 2; step 5 closed the matrix to `EJECUTIVO` only.
- **ISO 8601 for date range query (Decision):** Query params `desde` and `hasta` expect ISO 8601 strings (e.g. `?hasta=2026-11-15T23:59:59-03:00`). Parsing simple `YYYY-MM-DD` strings defaults to UTC midnight, which truncates Chilean local time (UTC-3) at 21:00 of the previous day.
- **Agenda filtering by start time:** `GET /api/visitas` filters by `fechaInicio` (when visits start), which matches standard calendar/agenda expectations. True interval overlap checks are reserved for RN-10 collision detection.
- **Chronological sorting:** `GET /api/visitas` sorts by `{ fechaInicio: 1 }` (ascending) so executives see upcoming visits first.
- **Property integration (step 3c, PR #28):** the `POST` no longer accepts `ejecutivoId` from the body. The property is read from the database, must be `activo: true` and `PUBLICADA` (RN-16), and its `ejecutivoId` is copied onto the visit (D10). `clienteId` is still read from the body and not validated against `Clientes` until the CLIENTE follow-up PR.
- **Whitelist of fields on creation:** only `propiedadId`, `clienteId`, `fechaInicio` and `observaciones` are read. `estado`, `resultado`, `fechaFin` and `ejecutivoId` are ignored; visits always start as `SOLICITADA`.
- **Informative 409 Conflict:** Overlap responses return `{ mensaje, visitaEnConflicto }` detailing the conflicting visit ID, interval, and status for clear debugging and UI feedback.
- **Concurrency limitation (Known race condition):** Two simultaneous `POST` requests for the same executive and interval could pass the overlap query before either writes. MongoDB lacks native interval exclusion constraints (unlike RN-14's partial unique index). Documented as an acceptable design limitation without multi-document transactions.
- **Transition table in the controller:** `TRANSICIONES` maps each state to its allowed targets (`SOLICITADA → CONFIRMADA | RECHAZADA | CANCELADA`, `CONFIRMADA → REALIZADA | CANCELADA`). Terminal states have no entry, so the helper uses `TRANSICIONES[estado] || []` and answers `409` instead of throwing a `TypeError`.
- **One transition helper:** `transicionarVisita` centralizes find → validate transition → save → bitacora → populate. The four `PATCH` handlers only pick the target state; an invalid transition returns `409` with `estadoActual` and `transicionesPermitidas`.
- **`resultado` must be a string:** `PATCH /resultado` rejects missing, blank or non-string values with `400` before the transition. Mongoose would otherwise cast a number to text and store it as a valid result.
- **`observacion` is sanitized before the audit log:** only strings reach `registrarBitacora`. A non-string body value would fail the cast after the visit was already saved, leaving a state change without an audit entry (verified: it returned `500` and the visit stayed `REALIZADA`).
- **Reschedule whitelist (`PUT`):** only `fechaInicio` and `observaciones` (string) are updated; `ejecutivoId`, `propiedadId`, `clienteId`, `estado` and `resultado` are ignored.
- **Reschedule does not re-check RN-16:** it adjusts the time of an existing agreement; if the property is no longer marketable the visit should be cancelled (`CANCELADA`). RN-16 applies when the visit is created.
- **Self-exclusion in the reschedule overlap check:** `_id: { $ne: visita._id }`, so moving a visit to the same hour (or shifting it slightly) does not collide with its own previous slot.
- **Audit log failure after save (transitions):** if `registrarBitacora` fails after `visita.save()`, the state change is already persisted while the response is an error and the entry is missing. Same save-then-log ordering as `POST`; accepted without multi-document transactions.
- **Populate on responses (Decision B):** `GET /api/visitas`, `GET /api/visitas/:id` and the `201` of `POST` populate `ejecutivoId` (`nombre email rol`) and `propiedadId` (`titulo direccion estado`), so the frontend receives the same shape everywhere.
- **Documented code (AGENTS.md rule 12):** every exported function gets an English JSDoc block (route, allowed roles, business rules, responses); the model file starts with a header comment pointing to `docs/DATA_MODEL.md`; comments are in English from now on when this model's files are edited.
- **Conditional visit fixtures (step 6):** `construirVisitas(propiedades, clientes)` in `fixtures/data/visitas.js`; not a static array. `seed.js` step 9 loads 6 visits only when the guard passes: **2** active `PUBLICADA` properties whose `ejecutivoId` matches a freshly seeded `EJECUTIVO`, and **at least 2** seeded clients (avoids `TypeError` on `cliente2._id` if the clients fixture shrinks); otherwise it logs `Visitas: omitidas (se necesitan 2 propiedades PUBLICADA con ejecutivo vigente y al menos 2 clientes)`. `Visita.deleteMany` always runs on seed.
- **Fixture insert (Mongoose 9):** `insertMany(..., { validateBeforeSave: false })` does not skip validation in Mongoose 9+. The seed uses `insertMany(..., { lean: true })` so the historical `REALIZADA` visit (past `fechaInicio`) can load; `lean` skips validation **and casting**, so the fixture provides `ObjectId` instances and `Date`s itself, and `createdAt`/`updatedAt` are set manually because the timestamp middleware does not run.
- **Fixture `clienteId` uses the seeded clients (2026-11-13):** with `clientes` merged, the old placeholders `650000000000000000000002/3` were dangling references (6/6 visits). `construirVisitas` now receives the documents returned by `Cliente.insertMany`, sorted by email, and uses `cliente1._id` / `cliente2._id`; the sixth visit is assigned to the second client so two different clients appear. The seed therefore has no fixed ids, and `populate("clienteId")` / `usuarios.clienteId` comparisons will resolve.
- **Fixture ids must be `ObjectId` instances (found in the step 6 review):** with `lean: true` a string `clienteId` was stored as a string; `countDocuments({ clienteId: ObjectId(...) })` returned 0 instead of 5, and a future `populate("clienteId")` would miss those visits. Verified again after the seeded-client change: `visitas` with a `clienteId` that does not exist in `clientes` = 0/6.
- **Local helper script removed (step 7):** `backend/scripts/seed-visitas-only.js` was a temporary workaround until the properties fixture existed. PR #33 merged `fixtures/data/propiedades.js` and the seed now empties and reloads `propiedades`, so `make seed` loads the visits by itself and the script (and its folder) was deleted.

## Coordination with other models

- **`propiedades` (Deyby, merged ✅ phase A, PR #28):** integration **done in step 3c**:
  1. The property is read with `findOne({ _id: propiedadId, activo: true })`; missing or soft-deleted → `400`.
  2. `estado === "PUBLICADA"` is required (RN-16) → `409` with `estadoActual` otherwise.
  3. `ejecutivoId` is copied from the property (D10) and no longer read from the body.
  `populate("propiedadId", "titulo direccion estado")` works; it does not cascade to `propietarioId` on the property response (by design).
- **Properties fixture (Deyby, merged ✅ PR #33):** `fixtures/data/propiedades.js` loads 11 properties (one per state, one soft-deleted), the seed empties `propiedades` and links the accounts `propietario@gup.cl` / `cliente@gup.cl`. The visit guard therefore runs on every `make seed` and inserts the 6 visits without touching `visitas.js`; the temporary helper script is gone.
- **`clientes` (Jose, merged ✅ PR #25; account link merged in PR #33):** `clienteId` reference and the fixtures now use the seeded clients. `usuarios.clienteId` is filled for `cliente@gup.cl` by the seed, so the "my visits" endpoint can compare against the token's user. **Still pending (follow-up PR):** `CLIENTE` endpoints, resolving `clienteId` from the session instead of the body, and validating that `clienteId` exists (`populate("clienteId", "nombre email")` in the responses).
- **`bitacora` (Deyby, merged ✅):** call `registrarBitacora` with `entidad: "VISITA"` on every state transition (RN-13). The enum now also has `ELIMINACION` (added for properties). **Open question:** it still has no `REPROGRAMACION`, and rescheduling (`PUT`) is not a state change, so ask Deyby to add it or accept not logging the reschedule and document why (current behaviour: it is not logged).

## Proposals for AGENTS.md

- ✅ **Accepted (2026-11-12, AGENTS.md → Rules / Data model):** *Validate soft delete against `DATA_MODEL.md`.* Do not assume `activo` or a `DELETE` endpoint exists on every model. Collections like `visitas` manage their lifecycle through domain states (`CANCELADA`), not soft delete. AGENTS.md now also requires `PUT`/`DELETE` to filter `{ _id, activo: true }` when the model does have soft delete.
- ✅ **Accepted (2026-11-12, AGENTS.md → Technical conventions):** *Check the actor × use case matrix before assigning roles.* `ADMIN` is not a superuser in this case; it only manages users/parameters and reads reports (CU10). Roles must come from the use-case matrix of the case specification, not from intuition.

## Local test data (working database, not in git)

`make seed` clears `tiposPropiedad`, `usuarios`, `clientes`, `propietarios`, `propiedades`, `visitas` and `bitacora`, then reloads everything in dependency order. Since PR #33, `propiedades` is also emptied, so the visit guard always finds the 11 fresh properties and loads the 6 visits on every run.

State after `make seed` (2026-11-13):

- `visitas` = **6**, on "Casa familiar con patio" and "Departamento con vista al mar" (both from `ejecutivo1`), one per state (`SOLICITADA`×2), 1 h duration, `ejecutivoId` copied from the property, `clienteId` an existing `ObjectId` (5 for `camila.rivas@mail.cl`, 1 for `cliente@gup.cl`).
- `propiedades` = **11** (one per state, 5 `PUBLICADA`, 1 soft-deleted), `clientes` = 3, `propietarios` = 3, `usuarios` = 5.
- `bitacora` = **0**: fixtures insert documents directly and do not simulate real operations.
- The soft-deleted property id changes on every seed (`6af684d4f4af770916491f49` at the last run); the step 7 suite takes it as a parameter.

The step 7 suite (`step7-full-2.ps1`, kept outside the repo in a temp folder) creates 8 visits with 2029 dates and 13 audit entries; run `make seed` afterwards to go back to the state above.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-09 | Step 0 & Step 1: Model creation, pre-validate hook for D8, validations and compound index | Model verified via temp script and Compass. Ready for Step 2 (read controllers). |
| 2026-11-09 | Step 2: Read controllers, routes and Postman test suite | Created `getVisitas` and `getVisitaById`, mounted in `app.js`. Verified all 9 Postman test cases (200, 400, 401, 403, 404). Step 2 completed. |
| 2026-11-09 | Step 3 (Part 1): POST /api/visitas with RN-10 overlap detection and RN-13 bitacora | Implemented whitelist, duration constant (DURACION_VISITA_MS), overlap query with $nin, bitacora logging on creation, and consistent populate on 201. Passed all Postman test cases (201, 409 conflict, 400 validation, whitelist check). |
| 2026-11-11 | Context re-entry after merging `development` into the branch (`e64e3aa`) | `propiedades` phase A (PR #28) is merged, so RN-16 and D10 are unblocked. New team rules: English JSDoc on every exported function and one focused commit per tested step. Next: document the visit files, then refactor `POST` against `Propiedad` (RN-16/D10), then `PUT` + PATCH transitions. |
| 2026-11-11 | Step 3b: JSDoc documentation across model, controller and routes | Documented `Visita`, `getVisitas`, `getVisitaById`, `postVisita` and the router following PR #30 standards; diff verified as comments-only. Smoke tests passed (`200`, `400`, `201`). Ready for Step 3c (Propiedad integration). |
| 2026-11-11 | Step 3c: `POST` validates the merged `Propiedad` (RN-16) and copies its executive (D10) | Property read with `activo: true`; missing/deleted `400`, not `PUBLICADA` `409` with `estadoActual`; `ejecutivoId` removed from the whitelist and copied from the property; `propiedadId` populated in `GET` and in the `201`. Verified 8/8 cases plus the whitelist and bitacora checks (`estado`/`resultado`/`fechaFin` ignored, `CREACION` without `estadoAnterior`). Next: step 3d (`PUT` + PATCH transitions). |
| 2026-11-11 | Memory sync before step 3d | Recorded the local test data left in the database (properties A/B and the 2027 visits) and the `ADMIN` role-matrix question to resolve in step 5. Branch is 6 commits ahead of `origin/feature/ignacio/visitas` and has not been pushed yet. |
| 2026-11-11 | Step 3d: `TRANSICIONES`, `transicionarVisita`, the four PATCH endpoints and `PUT` reschedule | PATCH verified: 200/409/400/401/403/404, bitacora `CAMBIO_ESTADO` with `estadoAnterior`/`estadoNuevo`. PUT verified: 200 on SOLICITADA and CONFIRMADA, `$ne` self-exclusion, 409 on overlap/terminal, 400 on bad date/whitelist, extra fields ignored. Next: step 5 role matrix. |
| 2026-11-11 | Step 3d fixes after review | Two `500` bugs found by the agent: `resultado` non-string crashed on `.trim()`, and a non-string `observacion` failed the Bitacora cast after the visit was saved (state changed, no audit entry). Fixed with a string type check, `observacion` sanitization and a `ValidationError` handler in `putVisita`; re-tested (`400` for `resultado: 123`, `200` + bitacora entry with empty `observacion`). |
| 2026-11-12 | Step 5: role matrix | Router restricted to `EJECUTIVO`; controller docstrings updated. Verified the full matrix (8 endpoints × EJECUTIVO/ADMIN/CLIENTE/PROPIETARIO/no token): `200/201` for the executive, `403` for the other roles, `401` without a token; `403` also with a malformed id (authorization runs before validation). `ejecutivo2` cancelled a visit created by `ejecutivo1` → `200` (Decision A). Next: step 6 (fixtures). |
| 2026-11-12 | Step 6: conditional visit fixtures + Mongoose 9 insert | Added `fixtures/data/visitas.js`, `seed.js` block (guard + `lean: true`), README row. Tested omitidas on `make seed`, 6 visits via `seed-visitas-only.js` + 2 Postman props, `GET /api/visitas` 200 with populate. Next: step 7 (full Postman + PR). |
| 2026-11-12 | Memory sync after step 6 | Recorded the real DB state (`visitas` = 0, 5 properties with stale `ejecutivoId`), fixed the Coordination section and the `clientes`/`ADMIN` note. Branch `feature/ignacio/visitas` is **9 commits ahead** of `origin/feature/ignacio/visitas` (`19f585a`) and nothing is pushed; step 6 is still uncommitted (`data/visitas.js`, `seed.js`, `fixtures/README.md`, the `PUT` docstring fix and this file, plus the untracked `scripts/seed-visitas-only.js`). |
| 2026-11-12 | Step 6 verification before the commit | `make seed` twice: `Visitas: omitidas...`, `visitas` = 0, and the second run deleted the 6 loaded visits (guard + `deleteMany`). With 2 fresh `PUBLICADA` properties and the local helper: 6 visits, one per state, 1 h duration, D10 match, timestamps, no RN-10 overlaps, `bitacora VISITA` = 0; API `200`/6 with populate, `400`/`401`/`403` on the error cases. Found `clienteId` stored as a string (`lean: true` skips casting; query by `ObjectId` returned 0), fixed with `mongoose.Types.ObjectId` placeholders and re-verified (query by `ObjectId` = 5, by string = 0). Pending: comment/whitespace nits, then the commit. |
| 2026-11-13 | Context re-entry after rebasing onto the new `development` | `clientes` (PR #25), `propietarios` (PR #27) and the property/client/owner fixtures + account links (PR #33) are merged. Branch rebased and pushed (`389ef92`, 11 commits ahead). `make seed` now loads 11 properties and the 6 visits by itself. Found the fixture `clienteId` placeholders were dangling (6/6); fixed now (see Decisions) instead of deferring. |
| 2026-11-13 | Fixture fix: visits reference the seeded clients | `construirVisitas(propiedades, clientes)`, `seed.js` captures `clientesInsertados` and passes them sorted by email, `fixtures/README.md` row updated, `backend/scripts/` removed. `make seed`: 6 visits, `clienteId` dangling = 0, distribution 5 `camila.rivas@mail.cl` / 1 `cliente@gup.cl`. |
| 2026-11-13 | Step 7: full Postman-equivalent pass on the rebased branch | 103/103 checks, 0 failures: happy path (`201` + 1 h `fechaFin` + D10 + populate), whitelists on `POST`/`PUT`, `400`/`404`/`409` error cases, RN-10 overlap (same and different property), RN-16, state machine, full role matrix (`401`/`403` for ADMIN/CLIENTE/PROPIETARIO), and audit log (8 `CREACION` + 5 `CAMBIO_ESTADO`, no `REPROGRAMACION`). `make seed` run again afterwards to leave a clean DB. Next: commits + PR. |
| 2026-11-13 | Rebase onto `development` (`c033f65`) | Conflicts in `app.js` (keep all routers) and `seed.js`/`fixtures/README.md` (Deyby seed + visit step 9). Rebased history pushed; then fixture fix for real `clienteId` after `clientes` merge. |
| 2026-11-13 | Commit `ec02ff1`: seeded clients + visit guard | `construirVisitas(propiedades, clientes)`; guard requires 2 `PUBLICADA` props + ≥2 clients; `fixtures/README.md` updated; re-tested `make seed` (`Visitas: 6`, dangling `clienteId` = 0). 103/103 pass on this commit. Branch **in sync** with `origin/feature/ignacio/visitas`. Next: Postman screenshots + open PR to `development`. |
