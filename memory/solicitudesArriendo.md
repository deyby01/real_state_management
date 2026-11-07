# solicitudesArriendo — SolicitudArriendo

> **Owner:** Roberto · **Branch:** `feature/roberto/rental-requests` · **Status:** 🚧 In progress (model, controller and routes written; creating/approving needs `Propiedad` and `Cliente`)
> **Specification:** [`docs/DATA_MODEL.md → solicitudesArriendo`](../docs/DATA_MODEL.md#solicitudesarriendo-rental-requests)
> **Depends on:** `propiedades` (Deyby), `clientes` (Jose), `usuarios` (✅), `bitacora` (✅) · **Used by:** —

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

## Plan

| # | Step | What to test | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | ✅ |
| 1 | Model `SolicitudArriendo.js` (fields, sub-schemas, enum, partial index) | Index visible in Compass | 🚧 Code done; Compass check pending |
| 2 | Controller: list and get by id | `200`, `400`, `403`, `404` | 🚧 Code done; Postman pending |
| 3 | Controller: create + state changes | `201`, `400`, `409` | 🚧 Code done; create blocked by `Propiedad`/`Cliente` |
| 4 | Soft delete | N/A: requests are never deleted, they end in `RECHAZADA`/`CANCELADA` | ✅ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ✅ Mounted; Postman pending |
| 6 | Fixtures in `fixtures/data/` + `seed.js` | `make seed` loads the data | 🚧 File ready; seed wiring blocked by `Propiedad`/`Cliente` |
| 7 | Full Postman pass + Pull Request | Happy path and error cases | ⬜ |

## Fields

| Field | Type | Detail |
|---|---|---|
| `propiedadId` | ObjectId, ref `"Propiedad"` | required |
| `clienteId` | ObjectId, ref `"Cliente"` | required |
| `ejecutivoId` | ObjectId, ref `"Usuario"` | required, copied from the property (never from the body) |
| `antecedentes` | sub-schema, required | `ingresosMensuales` (min 0), `ocupacion`, `numeroOcupantes` (min 1), `tieneMascotas` (default `false`) |
| `estado` | String enum | `PENDIENTE` (default), `EN_EVALUACION`, `APROBADA`, `RECHAZADA`, `CANCELADA` |
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
| cancelar | `PENDIENTE` → `CANCELADA` | `SOLICITUD` / `CAMBIO_ESTADO` |
| cancelar | `APROBADA` → `CANCELADA` (property → `PUBLICADA` if still `RESERVADA`) | `SOLICITUD` + `PROPIEDAD` / `LIBERACION_RESERVA` |

Any other transition returns `409`. All entries use `entidad: "SOLICITUD"` or `"PROPIEDAD"`.

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `POST` | `/api/solicitudes` | `CLIENTE` | `201`; invalid data `400`; property/client not found `404`; property not `PUBLICADA` `409` |
| `GET` | `/api/solicitudes` | `CLIENTE` (own), `EJECUTIVO` (assigned), `ADMIN` (all) | `200` |
| `GET` | `/api/solicitudes/:id` | owner / assigned `EJECUTIVO` / `ADMIN` | `200`; invalid id `400`; not yours `403`; not found `404` |
| `PATCH` | `/api/solicitudes/:id/evaluar` | assigned `EJECUTIVO`, `ADMIN` | `200`; invalid transition `409` |
| `PATCH` | `/api/solicitudes/:id/aprobar` | assigned `EJECUTIVO`, `ADMIN` | `200`; invalid transition or second approval `409` |
| `PATCH` | `/api/solicitudes/:id/rechazar` | assigned `EJECUTIVO`, `ADMIN` | `200`; invalid transition `409` |
| `PATCH` | `/api/solicitudes/:id/cancelar` | owner / assigned `EJECUTIVO` / `ADMIN` | `200`; invalid transition `409` |

State-change endpoints accept an optional `{ "observacion": "..." }` in the body, saved in `observaciones`. No token gives `401`; a role not listed gives `403`.

## Decisions

- **No transactions:** the `mongo:8` in `docker-compose.yml` is a single node (not a replica set). Approving and cancelling an approved request run in steps with compensation (if reserving/releasing the property fails, the request goes back to its previous state).
- **Lazy model lookup:** `Propiedad` and `Cliente` are resolved with `mongoose.model(...)` at call time, and there is no `populate`, so the app does not break at startup while those models are not merged. Calls that need them return `500` (`MissingSchemaError`) until they exist.
- **Client from the token:** the JWT only has `_id` and `rol`; the client is read with `Usuario.findById(req.usuario._id).clienteId` (`clienteIdDelUsuario`). That value is used **only for permissions**; the `clienteId` in the body is never trusted for access control.
- **Property state is logged too:** approving and releasing the reservation also insert a `bitacora` entry with `entidad: "PROPIEDAD"` (RN-13).
- **Releasing a reservation only if `RESERVADA`:** cancelling an approved request never turns an `ARRENDADA` property back to `PUBLICADA`.
- **Reuses the merged audit service:** `backend/src/services/bitacora.service.js`, not a local copy.

## Coordination with other models

- **`propiedades` (Deyby):** the controller assumes `estado` (`PUBLICADA`, `RESERVADA`) and `ejecutivoId` on the property. Confirm the field names when the model is merged.
- **`clientes` (Jose):** the model must be registered as `"Cliente"`.
- **`bitacora` (Deyby):** uses `registrarBitacora` with `entidad: "PROPIEDAD"` and actions `RESERVA` / `LIBERACION_RESERVA` (already in the enum).
- **`usuarios` (Deyby):** once registration creates the `clientes` record, remove the temporary `req.body.clienteId` fallback in `crearSolicitud`.

## Pending

- **Temporary:** `usuarios.clienteId` is still `null` (registration does not create the `Cliente` yet, follow-up in `memory/usuarios.md`). Until then `POST` accepts `clienteId` in the body when the user has none.
- Wire the fixtures in `seed.js` after `Propiedad` and `Cliente` are inserted: `SolicitudArriendo.deleteMany({})` and `insertMany(buildSolicitudesArriendo({ propiedades, clientes }))`.
- Verify the partial index in Compass.
- Postman tests + Pull Request.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-04 | Model, controller, routes and fixtures written by the developer; review found a wrong audit import, naming issues, an authorization bypass through `req.body.clienteId`, and a missing property-state guard. | Fixed: `services/bitacora.service.js` import, file names, `app.js` mounting, permission helper split, `RESERVADA` guard, property `bitacora` entries. Next: Postman + dependencies. |
