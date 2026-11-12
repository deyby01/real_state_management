# visitas — Visita

> **Owner:** Ignacio · **Branch:** `feature/ignacio/visitas` · **Status:** 🚧 In progress  
> **Specification:** [`docs/DATA_MODEL.md → visitas`](../docs/DATA_MODEL.md#visitas-visit-requests)  
> **Depends on:** `propiedades` (Deyby, merged ✅ phase A, PR #28), `clientes` (Jose, not merged), `usuarios` (merged ✅); writes to `bitacora` (merged ✅)  
> **Used by:** — (nothing references `visitas` yet; it feeds the visit reports, RF12)

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read DATA_MODEL, state machine, overlap rule and libraries | — | ✅ |
| 1 | Model `backend/src/models/Visita.js` | Fields, validations, future date check, compound index visible in Compass | ✅ |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create, modify date and state transitions (business rules + bitacora) | `201`, `400`, `409` | 🚧 (POST done with RN-16/D10 against the merged `Propiedad`; pending `PUT` and the PATCH transitions) |
| 4 | Soft delete | — | N/A: visits are voided with CANCELADA; DATA_MODEL has no activo |
| 5 | Routes + mounting in `app.js` + role protection | No token `401`, wrong role `403` | 🚧 (Partially mounted in Step 2; pending full role matrix for POST/PUT/PATCH) |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads sample visits | ⬜ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases (`400`, `401`, `403`, `409`) | ⬜ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/visitas?estado=&propiedadId=&ejecutivoId=&desde=&hasta=` | `EJECUTIVO`, `ADMIN` | `200`, `400`, `401`, `403` |
| `GET` | `/api/visitas/:id` | `EJECUTIVO`, `ADMIN` | `200`, `400`, `401`, `403`, `404` |
| `POST` | `/api/visitas` | `EJECUTIVO`, `ADMIN` (`CLIENTE`* once linked) | `201`, `400`, `401`, `403`, `409` |
| `PUT` | `/api/visitas/:id` | `EJECUTIVO`, `ADMIN` (`CLIENTE`* once linked; reschedule dates while `SOLICITADA` or `CONFIRMADA`) | `200`, `400`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/confirmar` | `EJECUTIVO`, `ADMIN` | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/rechazar` | `EJECUTIVO`, `ADMIN` | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/cancelar` | `CLIENTE`*, `EJECUTIVO`, `ADMIN` | `200`, `401`, `403`, `404`, `409` |
| `PATCH` | `/api/visitas/:id/resultado` | `EJECUTIVO`, `ADMIN` | `200`, `400`, `401`, `403`, `404`, `409` |

> `*`: Pending resolution of `usuarios.clienteId` linkage with `clientes`.

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
- **Roles per endpoint are a proposal:** *(pending professor validation)* Open question for step 5: `ADMIN` currently sees and operates every visit (list, create, reschedule, transitions). If the case limits `ADMIN` to supervision (read-only) and leaves the operation to the assigned `EJECUTIVO`, the matrix has to move to per-route `permitirRoles` plus an ownership check. Confirm with the professor before closing step 5.
- **Automatic calculation of `fechaFin` (D8):** Computed via a Mongoose `pre("validate")` hook (`fechaFin = fechaInicio + 1 hour`). Guarantees duration consistency across controllers, fixtures, and scripts.
- **Document pattern for updates:** Rescheduling (`PUT`) must use `doc = await Visita.findById(); doc.fechaInicio = ...; await doc.save()`. This ensures both the future date validator and the `pre("validate")` hook execute properly without query-context issues (`TypeError: this.isModified`).
- **Executive visibility (Decision A):** `EJECUTIVO` and `ADMIN` can see all visits by default to facilitate evaluation demos, but can filter by individual agendas using `?ejecutivoId=`.
- **Supported filters for listing (Decision B):** `GET /api/visitas` supports filtering by `estado` (validated against `ESTADOS_VISITA`), `propiedadId`, `ejecutivoId`, and date range (`desde` and `hasta` with `$gte` and `$lte`). Invalid query params return `400 Bad Request`.
- **Early route mounting (Decision C1):** Mounted `visitaRouter` in `app.js` during Step 2 protected with `verificarToken` and `permitirRoles("ADMIN", "EJECUTIVO")` to enable real HTTP testing in Postman.
- **ISO 8601 for date range query (Decision):** Query params `desde` and `hasta` expect ISO 8601 strings (e.g. `?hasta=2026-11-15T23:59:59-03:00`). Parsing simple `YYYY-MM-DD` strings defaults to UTC midnight, which truncates Chilean local time (UTC-3) at 21:00 of the previous day.
- **Agenda filtering by start time:** `GET /api/visitas` filters by `fechaInicio` (when visits start), which matches standard calendar/agenda expectations. True interval overlap checks are reserved for RN-10 collision detection.
- **Chronological sorting:** `GET /api/visitas` sorts by `{ fechaInicio: 1 }` (ascending) so executives see upcoming visits first.
- **Temporary contract retired (step 3c):** `propiedades` is merged (PR #28), so the `POST` no longer accepts `ejecutivoId` from the body. The property is read from the database, must be `activo: true` and `PUBLICADA` (RN-16), and its `ejecutivoId` is copied onto the visit (D10). `clienteId` stays in the body until `clientes` is merged.
- **Whitelist of fields on creation:** only `propiedadId`, `clienteId`, `fechaInicio` and `observaciones` are read. `estado`, `resultado`, `fechaFin` and `ejecutivoId` are ignored; visits always start as `SOLICITADA`.
- **Informative 409 Conflict:** Overlap responses return `{ mensaje, visitaEnConflicto }` detailing the conflicting visit ID, interval, and status for clear debugging and UI feedback.
- **Concurrency limitation (Known race condition):** Two simultaneous `POST` requests for the same executive and interval could pass the overlap query before either writes. MongoDB lacks native interval exclusion constraints (unlike RN-14's partial unique index). Documented as an acceptable design limitation without multi-document transactions.
- **Populate on responses (Decision B):** `GET /api/visitas`, `GET /api/visitas/:id` and the `201` of `POST` populate `ejecutivoId` (`nombre email rol`) and `propiedadId` (`titulo direccion estado`), so the frontend receives the same shape everywhere.
- **Documented code (AGENTS.md rule 12):** every exported function gets an English JSDoc block (route, allowed roles, business rules, responses); the model file starts with a header comment pointing to `docs/DATA_MODEL.md`; comments are in English from now on when this model's files are edited.

## Coordination with other models

- **`propiedades` (Deyby, merged ✅ phase A, PR #28):** integration **done in step 3c**:
  1. The property is read with `findOne({ _id: propiedadId, activo: true })`; missing or soft-deleted → `400`.
  2. `estado === "PUBLICADA"` is required (RN-16) → `409` with `estadoActual` otherwise.
  3. `ejecutivoId` is copied from the property (D10) and no longer read from the body.
  `populate("propiedadId", "titulo direccion estado")` works; it does not cascade to `propietarioId`, so it is safe even though `Propietario` is not merged.
- **`clientes` (Jose, not merged):** `clienteId` reference. **Blocking for `CLIENTE` endpoints:** `usuarios.clienteId` currently defaults to `null` because registration does not create a `clientes` document. Until Jose and Deyby agree on linking them, creation is tested/allowed via `EJECUTIVO`/`ADMIN` or by passing `clienteId` in testing. Once `Cliente` and `usuarios.clienteId` are integrated, `clienteId` should be resolved from the authenticated session or validated against existing clients.
- **`bitacora` (Deyby, merged ✅):** call `registrarBitacora` with `entidad: "VISITA"` on every state transition (RN-13). The enum now also has `ELIMINACION` (added for properties). **Open question:** it still has no `REPROGRAMACION`, and rescheduling (`PUT`) is not a state change, so ask Deyby to add it or accept not logging the reschedule and document why.

## Proposals for AGENTS.md

- **Validate soft delete against `DATA_MODEL.md`:** Do not assume `activo` or a `DELETE` endpoint exists on every model. Check `docs/DATA_MODEL.md` explicitly: collections like `visitas` manage lifecycle via domain states (`CANCELADA`), not soft delete.

## Local test data (working database, not in git)

`make seed` still clears only `tiposPropiedad`, `usuarios` and `bitacora` (step 6 adds `visitas` and `propiedades`), so the step 3c tests left documents in the local `real_estate` database:

- Property `6af518d723479ad04a506214` — "Depto prueba RN16 A", `PUBLICADA`, `activo: true` (still usable for step 3d).
- Property `6af518d723479ad04a506216` — "Depto prueba RN16 B", `PUBLICADA`, `activo: false` (soft-delete case).
- Visits created for 3c: `6af518d723479ad04a506219` (2027-10-05), `6af518d723479ad04a50621b` (2027-10-06), `6af518e423479ad04a50621f` (2027-10-10), all `SOLICITADA`; older visits from steps 2–3 remain in 2026-11-15 and 2027-06/08/09/10-15.
- Their `bitacora` entries (`entidad: "VISITA"`) cannot be deleted (rule 12).

Optional cleanup before the fixtures step (local test documents only):

```bash
docker compose exec mongo mongosh real_estate --quiet --eval "db.visitas.deleteMany({ fechaInicio: { \$gte: new Date('2027-01-01') } }); db.propiedades.deleteMany({ titulo: /Depto prueba RN16/ })"
```

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
