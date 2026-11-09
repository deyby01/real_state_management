# visitas — Visita

> **Owner:** Ignacio · **Branch:** `feature/ignacio/visitas` · **Status:** 🚧 In progress  
> **Specification:** [`docs/DATA_MODEL.md → visitas`](../docs/DATA_MODEL.md#visitas-visit-requests)  
> **Depends on:** `propiedades` (Deyby, not merged), `clientes` (Jose, not merged), `usuarios` (merged ✅); writes to `bitacora` (merged ✅)  
> **Used by:** — (nothing references `visitas` yet; it feeds the visit reports, RF12)

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read DATA_MODEL, state machine, overlap rule and libraries | — | ✅ |
| 1 | Model `backend/src/models/Visita.js` | Fields, validations, future date check, compound index visible in Compass | ✅ |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create, modify date and state transitions (business rules + bitacora) | `201`, `400`, `409` | ⬜ |
| 4 | Soft delete | — | N/A: visits are voided with CANCELADA; DATA_MODEL has no activo |
| 5 | Routes + mounting in `app.js` + role protection | No token `401`, wrong role `403` | 🚧 (Partially mounted in Step 2; pending full role matrix for POST/PUT/PATCH) |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads sample visits | ⬜ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases (`400`, `401`, `403`, `409`) | ⬜ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/visitas?estado=&propiedadId=&ejecutivoId=&desde=&hasta=` | `EJECUTIVO`, `ADMIN` | `200`, `400`, `401`, `403` |
| `GET` | `/api/visitas/:id` | `EJECUTIVO`, `ADMIN` | `200`, `400`, `401`, `403`, `404` |
| `POST` | `/api/visitas` | `CLIENTE`*, `EJECUTIVO`, `ADMIN` | `201`, `400`, `401`, `409` |
| `PUT` | `/api/visitas/:id` | `CLIENTE`*, `EJECUTIVO`, `ADMIN` (reschedule dates while `SOLICITADA` or `CONFIRMADA`) | `200`, `400`, `401`, `403`, `404`, `409` |
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
- **Visits only on `PUBLICADA` properties (RN-16):** Checked before creating a visit → `409 Conflict`.
- **No `DELETE` and no `activo` field:** `visitas` does not have an `activo` field in `DATA_MODEL.md`. A visit is voided using the `CANCELADA` status. *(pending professor validation)*
- **Roles per endpoint are a proposal:** *(pending professor validation)*
- **Automatic calculation of `fechaFin` (D8):** Computed via a Mongoose `pre("validate")` hook (`fechaFin = fechaInicio + 1 hour`). Guarantees duration consistency across controllers, fixtures, and scripts.
- **Document pattern for updates:** Rescheduling (`PUT`) must use `doc = await Visita.findById(); doc.fechaInicio = ...; await doc.save()`. This ensures both the future date validator and the `pre("validate")` hook execute properly without query-context issues (`TypeError: this.isModified`).
- **Executive visibility (Decision A):** `EJECUTIVO` and `ADMIN` can see all visits by default to facilitate evaluation demos, but can filter by individual agendas using `?ejecutivoId=`.
- **Supported filters for listing (Decision B):** `GET /api/visitas` supports filtering by `estado` (validated against `ESTADOS_VISITA`), `propiedadId`, `ejecutivoId`, and date range (`desde` and `hasta` with `$gte` and `$lte`). Invalid query params return `400 Bad Request`.
- **Early route mounting (Decision C1):** Mounted `visitaRouter` in `app.js` during Step 2 protected with `verificarToken` and `permitirRoles("ADMIN", "EJECUTIVO")` to enable real HTTP testing in Postman.
- **ISO 8601 for date range query (Decision):** Query params `desde` and `hasta` expect ISO 8601 strings (e.g. `?hasta=2026-11-15T23:59:59-03:00`). Parsing simple `YYYY-MM-DD` strings defaults to UTC midnight, which truncates Chilean local time (UTC-3) at 21:00 of the previous day.
- **Agenda filtering by start time:** `GET /api/visitas` filters by `fechaInicio` (when visits start), which matches standard calendar/agenda expectations. True interval overlap checks are reserved for RN-10 collision detection.
- **Chronological sorting:** `GET /api/visitas` sorts by `{ fechaInicio: 1 }` (ascending) so executives see upcoming visits first.

## Coordination with other models

- **`propiedades` (Deyby, not merged):** Read `ejecutivoId` and verify `estado === "PUBLICADA"` (RN-16). `populate` can only be used once `Propiedad` is merged into `development`.
- **`clientes` (Jose, not merged):** `clienteId` reference. **Blocking for `CLIENTE` endpoints:** `usuarios.clienteId` currently defaults to `null` because registration does not create a `clientes` document. Until Jose and Deyby agree on linking them, creation will be tested/allowed via `EJECUTIVO`/`ADMIN` or passing `clienteId` in testing.
- **`bitacora` (Deyby, merged ✅):** Call `registrarBitacora` with `entidad: "VISITA"` on every state transition (RN-13).

## Proposals for AGENTS.md

- **Validate soft delete against `DATA_MODEL.md`:** Do not assume `activo` or a `DELETE` endpoint exists on every model. Check `docs/DATA_MODEL.md` explicitly: collections like `visitas` manage lifecycle via domain states (`CANCELADA`), not soft delete.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-09 | Step 0 & Step 1: Model creation, pre-validate hook for D8, validations and compound index | Model verified via temp script and Compass. Ready for Step 2 (read controllers). |
| 2026-11-09 | Step 2: Read controllers, routes and Postman test suite | Created `getVisitas` and `getVisitaById`, mounted in `app.js`. Verified all 9 Postman test cases (200, 400, 401, 403, 404). Step 2 completed. |