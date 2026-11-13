# solicitudesArriendo — SolicitudArriendo

> **Owner:** Roberto · **Branch:** `feature/roberto/rental-requests` · **Status:** ✅ Merged (PR #24, 2026-11-13). Pending: Postman screenshots in the PR; whether a client may send several `PENDIENTE` requests for the same property (pending professor validation)
> **Specification:** [`docs/DATA_MODEL.md → solicitudesArriendo`](../docs/DATA_MODEL.md#solicitudesarriendo-rental-requests)
> **Depends on:** `propiedades` (✅ PR #28 phase A), `clientes` (✅ PR #25), `usuarios` (✅), `bitacora` (✅) · **Used by:** —

## Why it matters to the team

This model drives the rental flow and the property reservation. It is the only one that changes another model's state (`Propiedad`: `PUBLICADA` ↔ `RESERVADA`) and it enforces **RN-14**: one `APROBADA` request per property.

| Layer | File |
|---|---|
| Model | `backend/src/models/SolicitudArriendo.js` |
| Controller | `backend/src/controllers/solicitudArriendo.controller.js` |
| Routes | `backend/src/routes/solicitudArriendo.routes.js` |
| Mounting | `app.use("/api/solicitudes", solicitudRouter)` in `backend/src/app.js` |
| Fixtures | `backend/src/fixtures/data/solicitudesArriendo.js` (4 requests) |
| Audit helper | `backend/src/services/bitacora.service.js` (`registrarBitacora`) |

## Current state (2026-11-12, fixtures and seed)

- The branch now includes merge `523153c` of `origin/development`, which brought **PR #33**: 11 property fixtures, the seed's `mapaDeIds` / `buscarId` helpers and the `usuarios.clienteId` link for `cliente@gup.cl` (Ana). The PR is #24.
- The eight review commits below were already applied and pushed before that merge; they validate the controller logic:

```
c63eda6 fix: require state in rental request model
5fd8ca2 refactor: import property and client models directly
c5640a4 fix: take rental request client from the token only
c2da209 fix: ignore soft-deleted properties and clients in rental requests
4c75777 fix: restrict rental request routes to clients and executives
7e7a339 fix: only allow clients to cancel pending rental requests
4de0c86 docs: document rental request flow with JSDoc
a968d8f docs: update rental requests memory
```

- `backend/src/fixtures/data/solicitudesArriendo.js` is now a fixed array of 5 requests (one per state) that reference a property by title and a client by email. `seed.js` translates them into `_id` values and copies `ejecutivoId` from the property (D10). "Departamento con vista al mar" is left without a request so one can be created from scratch in Postman.
- `make seed` ran twice successfully: 5 requests, no empty `propiedadId`/`clienteId`/`ejecutivoId`; the `APROBADA` request matches the `RESERVADA` property; `cliente@gup.cl` is linked to Ana.
- The controller now answers **404** (not 403) when the request exists but belongs to another client or executive, matching AGENTS.md.
- Remaining work: Postman screenshots, PR #24 description/notes and re-review, and the visual index check in Compass.

## Plan

| # | Step | What to test | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | ✅ |
| 1 | Model `SolicitudArriendo.js` (fields, sub-schemas, enum, partial index, required `estado`) | Index visible in Compass | 🚧 Code done; Compass check pending |
| 2 | Controller: list and get by id | `200`, `400`, `404` | 🚧 Code done; live checks pass; Postman pending |
| 3 | Controller: create + state changes | `201`, `400`, `409` | 🚧 Code done; live checks pass; Postman pending |
| 4 | Soft delete | N/A: requests are never deleted, they end in `RECHAZADA`/`CANCELADA` | ✅ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ✅ Mounted; roles verified live; Postman screenshots pending |
| 6 | Fixtures in `fixtures/data/` + `seed.js` | `make seed` loads the data | ✅ 5 requests wired; seed run twice without errors |
| 7 | Full Postman pass + Pull Request | Happy path and error cases | 🚧 Live checks pass; Postman screenshots and PR notes pending |

## Fields

| Field | Type | Detail |
|---|---|---|
| `propiedadId` | ObjectId, ref `"Propiedad"` | required |
| `clienteId` | ObjectId, ref `"Cliente"` | required; taken from the token, never from the body |
| `ejecutivoId` | ObjectId, ref `"Usuario"` | required, copied from the property (never from the body) |
| `antecedentes` | sub-schema, required | `ingresosMensuales` (min 0), `ocupacion`, `numeroOcupantes` (min 1), `tieneMascotas` (default `false`) |
| `estado` | String enum, required | `PENDIENTE` (default), `EN_EVALUACION`, `APROBADA`, `RECHAZADA`, `CANCELADA` |
| `observaciones` | `[{ texto, usuarioId, fecha }]` | `_id: false` |

Options: `timestamps: true`, `collection: "solicitudesArriendo"`.
Index (RN-14): `{ propiedadId: 1 }`, unique, `partialFilterExpression: { estado: "APROBADA" }` → duplicate approval gives `11000` → `409`.

## State transitions

| Action | From → To | Bitácora |
|---|---|---|
| create | — → `PENDIENTE` | `SOLICITUD` / `CREACION` |
| evaluar | `PENDIENTE` → `EN_EVALUACION` | `SOLICITUD` / `CAMBIO_ESTADO` |
| aprobar | `EN_EVALUACION` → `APROBADA` (property → `RESERVADA`) | `SOLICITUD` / `RESERVA` + `PROPIEDAD` / `RESERVA` |
| rechazar | `EN_EVALUACION` → `RECHAZADA` | `SOLICITUD` / `CAMBIO_ESTADO` |
| cancelar (CLIENTE) | `PENDIENTE` → `CANCELADA` | `SOLICITUD` / `CAMBIO_ESTADO` |
| cancelar (EJECUTIVO) | `PENDIENTE` → `CANCELADA` | `SOLICITUD` / `CAMBIO_ESTADO` |
| cancelar (EJECUTIVO) | `APROBADA` → `CANCELADA` (property → `PUBLICADA` if still `RESERVADA`) | `SOLICITUD` + `PROPIEDAD` / `LIBERACION_RESERVA` |

Any other transition returns `409`. A CLIENTE cannot cancel an `APROBADA` request: releasing the reservation is CU9 (executive). All entries use `entidad: "SOLICITUD"` or `"PROPIEDAD"`.

## Endpoints

Roles come from the use-case matrix (§3.1): CU8 = CLIENTE, CU9 = EJECUTIVO, and the API table lists "Cliente / Ejecutivo". **ADMIN is intentionally not allowed** on this router.

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `POST` | `/api/solicitudes` | `CLIENTE` | `201`; invalid data `400`; no client profile linked `409`; property/client not found `404`; property not `PUBLICADA` `409` |
| `GET` | `/api/solicitudes` | `CLIENTE` (own), `EJECUTIVO` (assigned) | `200` |
| `GET` | `/api/solicitudes/:id` | owner `CLIENTE` / assigned `EJECUTIVO` | `200`; invalid id `400`; not found or not yours `404` |
| `PATCH` | `/api/solicitudes/:id/evaluar` | assigned `EJECUTIVO` | `200`; invalid transition `409`; not found or not yours `404` |
| `PATCH` | `/api/solicitudes/:id/aprobar` | assigned `EJECUTIVO` | `200`; invalid transition or second approval `409`; not found or not yours `404` |
| `PATCH` | `/api/solicitudes/:id/rechazar` | assigned `EJECUTIVO` | `200`; invalid transition `409`; not found or not yours `404` |
| `PATCH` | `/api/solicitudes/:id/cancelar` | owner `CLIENTE` (only `PENDIENTE`) / assigned `EJECUTIVO` | `200`; invalid transition `409`; not found or not yours `404` |

State-change endpoints accept an optional `{ "observacion": "..." }` in the body, saved in `observaciones`. No token gives `401`; a role not allowed by the router gives `403`; an allowed role asking for someone else's request gets `404`, so the id cannot be probed.

## Decisions

- **No transactions:** the `mongo:8` in `docker-compose.yml` is a single node (not a replica set). Approving and cancelling an approved request run in steps with compensation (if reserving/releasing the property fails, the request goes back to its previous state).
- **Direct imports:** `Propiedad` and `Cliente` are imported normally now that both models are merged (PR #28 and PR #25). The earlier lazy `mongoose.model(...)` lookup was removed.
- **Client identity from the token only:** the JWT only has `_id` and `rol`; the client is read with `Usuario.findById(req.usuario._id).clienteId` (`clienteIdDelUsuario`). If the account has no linked client profile, creation answers **`409` "Tu cuenta aún no tiene un perfil de cliente asociado"** instead of trusting a `clienteId` from the body (rule 17).
- **ADMIN out of the whole router:** CU9 belongs to the executive and the API table lists only client/executive; same reasoning used to remove ADMIN from `/api/propiedades` (CU3). Management reports (CU10) will use their own route, not this one.
- **404 for other users' requests:** when the request exists but belongs to another client or executive, `obtenerSolicitud` and `cargarParaCambio` answer `404 "Solicitud no encontrada"` instead of `403`, so the id cannot be probed (AGENTS.md HTTP status codes). The router still answers `403` for a role that is not allowed at all.
- **A CLIENTE only cancels `PENDIENTE`:** `APROBADA` → `CANCELADA` releases the reservation and belongs to the executive (DATA_MODEL 6.2, RF11/CU9). The executive can cancel from `PENDIENTE` or `APROBADA`.
- **Active records only:** the property is read with `{ _id, activo: true }` when creating, approving and releasing, and the client with `{ _id, activo: true }` when creating. A soft-deleted record cannot be used even if its `estado` still says `PUBLICADA`.
- **`estado` is required:** DATA_MODEL marks it as required; the schema keeps the `PENDIENTE` default.
- **Property state is logged too:** approving and releasing the reservation also insert a `bitacora` entry with `entidad: "PROPIEDAD"` (RN-13).
- **Releasing a reservation only if `RESERVADA`:** cancelling an approved request never turns an `ARRENDADA` property back to `PUBLICADA`.
- **Reuses the merged audit service:** `backend/src/services/bitacora.service.js`, not a local copy.
- **`req.body ?? {}` on create:** a request without a JSON body answers `400`, not `500`.

## Coordination with other models

- **`propiedades` (Deyby, ✅ PR #28 + PR #33):** the controller uses `estado` (`PUBLICADA`, `RESERVADA`), `ejecutivoId` and `activo`, matching his model. PR #33 added 11 property fixtures and the `mapaDeIds` / `buscarId` helpers reused by this seed step.
- **`clientes` (Jose, ✅ PR #25):** the model is registered as `"Cliente"` and exposes `activo`; the controller now imports it directly.
- **`bitacora` (Deyby, ✅):** uses `registrarBitacora` with `entidad: "PROPIEDAD"` and actions `RESERVA` / `LIBERACION_RESERVA`.
- **`usuarios` (Deyby, ✅):** public registration still does **not** create the `clientes` record, so a self-registered account has `usuarios.clienteId = null` and gets `409`. Since PR #33, the seed links `cliente@gup.cl` to Ana, so the test client can create requests right after `make seed`. The `clienteId` fallback from the body remains removed for security.

## Test evidence (2026-11-12, live backend + Docker + seed)

21/21 HTTP checks passed against `http://localhost:4000/api` after `make seed` (property fixtures still absent, so two properties were created through the API and one owner/client were taken from the fixtures). The client was linked temporarily with `db.usuarios.updateOne({email:"cliente@gup.cl"},{$set:{clienteId:<Ana._id>}})`, and the link was reverted + the database re-seeded afterwards.

| Area | Checks | Result |
|---|---|---|
| Create | `201`; `clienteId` from token; body `clienteId` of another client ignored; no profile `409` "Tu cuenta aún no tiene un perfil de cliente asociado" | ✅ |
| Auth/roles | no token `401`; `ADMIN` on `GET /solicitudes` `403`; `CLIENTE` on `evaluar` `403`; `EJECUTIVO` `200` | ✅ |
| Flow | evaluate `200`; approve `200` → property `RESERVADA`; second approval `409`; executive cancel `200` → property `PUBLICADA` | ✅ |
| Cancel rules | `CLIENTE` cannot cancel `APROBADA` (`409`) nor `EN_EVALUACION` (`409`); can cancel `PENDIENTE` (`200`) | ✅ |
| Soft delete | property deleted with `DELETE` → creating a request answers `404` | ✅ |

### Fixtures and seed validation (2026-11-12, after PR #33)

| Check | Result |
|---|---|
| `make seed` twice in a row | ✅ `Seed completado` both times, 5 requests each time |
| MongoDB `solicitudesArriendo` | ✅ 5 docs, 0 empty `propiedadId`/`clienteId`/`ejecutivoId`; one per state; `APROBADA` ↔ `RESERVADA` property |
| CLIENTE list | ✅ `200`, exactly 2 own requests (`PENDIENTE`, `RECHAZADA`) |
| EJECUTIVO list | ✅ `200`, 3 assigned requests, all with his `ejecutivoId` |
| POST on "Departamento con vista al mar" | ✅ `201` `PENDIENTE`; `clienteId` from token (bogus body ignored); `ejecutivoId` copied from the property |
| CLIENTE cancels that pending request | ✅ `200` `CANCELADA` |
| EJECUTIVO cancels the seeded `APROBADA` | ✅ `200` `CANCELADA`; property returns to `PUBLICADA` (re-seeded afterwards) |
| No token / ADMIN | ✅ `401` / `403` |
| Other user's request | ✅ `404` on GET (other client and other executive), PATCH (other executive) and unknown id |

## Pending

- Verify the partial index and the 5 seeded documents visually in Compass.
- Postman screenshots (create/approve/second approval `409`/`ADMIN 403`/cancel and one `404`) and update PR #24 description + *Notes for the reviewer*; then ask Deyby for the final review.

## Proposals for AGENTS.md

- **Security lesson (2026-11-12):** when an endpoint depends on a profile that is not linked yet, **fail closed** (`409`, clear message) instead of falling back to an identifier sent in the body. The fallback turns a temporary data gap into an impersonation hole.
- **Scope lesson (2026-11-12):** a route's roles come from the use-case matrix, not from "who seems powerful enough". CU9 is executive-only, so ADMIN must not be added "just in case".

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-04 | Model, controller, routes and fixtures written by the developer; review found a wrong audit import, naming issues, an authorization bypass through `req.body.clienteId`, and a missing property-state guard. | Fixed: `services/bitacora.service.js` import, file names, `app.js` mounting, permission helper split, `RESERVADA` guard, property `bitacora` entries. Next: Postman + dependencies. |
| 2026-11-12 | Merged `development` (now includes `clientes` PR #25, `propietarios` PR #27 and `propiedades` phase A PR #28) into the branch; conflict only in `app.js`, resolved keeping all four routers. | Merge committed and pushed. Dependencies unblocked. |
| 2026-11-12 | Applied Deyby's review in focused commits: `required` on `estado`; direct `Propiedad`/`Cliente` imports; client identity from the token with `409` when unlinked; active-only property/client reads; ADMIN removed from the router and permission helpers; clients can only cancel `PENDIENTE`; English JSDoc and comments; `req.body ?? {}`. | Syntax checks pass. |
| 2026-11-12 | Ran the live smoke test after starting the Docker stack and seeding: 21/21 checks passed (create from token, roles, approve/reserve, second approval `409`, cancel rules, soft delete `404`, unlinked client `409`). Reverted the temporary link, re-seeded the database and pushed the eight commits. | Branch in sync at `a968d8f`, PR #24 updated. |
| 2026-11-12 | Merged PR #33 from `development`. Rewrote the fixtures as a fixed array of 5 (one per state, property by title, client by email), wired them into `seed.js` (`deleteMany` + `insertMany`, copying `ejecutivoId` from the property), updated the fixtures README, and switched other users' requests from `403` to `404`. | `make seed` twice OK; 5 requests, no empty references; API checks pass (lists, create `201`, cancel approved releases the property, `401`/`403`/`404`). Next: Postman screenshots and PR #24 re-review. |
