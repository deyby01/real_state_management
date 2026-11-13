# propiedades — Propiedad

> **Owner:** Deyby · **Branch:** `feature/deyby/propiedades` · **Status:** 🚧 Phase A merged (PR #28, 2026-11-10); phase B not started
> **Specification:** [`docs/DATA_MODEL.md → propiedades`](../docs/DATA_MODEL.md#propiedades-the-center-of-the-model), [state machine 6.1](../docs/DATA_MODEL.md#61-property)
> **Depends on:** `tiposPropiedad` (✅), `usuarios` (✅, `ejecutivoId`), `bitacora` (✅), `propietarios` (✅ PR #27: phase B unblocked) · **Used by:** `visitas` (Ignacio), `solicitudesArriendo` (Roberto), the public catalog and the landing page

## Plan

This is the largest model, so it is split into **two phases**, each one with its own Pull Request. Phase A gives Ignacio and Roberto a merged `Propiedad` to reference as early as possible.

### Phase A — Model, management and states

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: embedded subdocuments, several references, `estado` vs `activo`, state machine | — | ✅ |
| 1 | Model `backend/src/models/Propiedad.js`: embedded `direccion` and `imagenes`, three references, `estado` enum, indexes | Fields and indexes in Compass | ✅ (5 validation tests from the container; 3 indexes) |
| 2 | Controller: create (always `DISPONIBLE`, bitacora `CREACION`), list and get by id | `201`, `200`, `404`, invalid id `400` | ✅ Create (8 Postman tests: mass assignment ignored, `CREACION` in bitacora); list and get by id (7 Postman tests) |
| 3 | Controller: update data (never `estado`) and soft delete | `200`; record kept with `activo: false` | ✅ 3a update (7 Postman tests); 3b soft delete (7 tests: `404` after delete, still in Compass, `ELIMINACION` in bitacora). The `409` for `RESERVADA`/`ARRENDADA` is tested in step 4 |
| 4 | Controller: `PATCH /:id/estado` with the transition table + bitacora `CAMBIO_ESTADO` | Allowed `200`; not allowed `409`; `RESERVADA` as target `409` | ✅ (15 Postman tests, including the `409` on delete for `RESERVADA`/`ARRENDADA`, simulated by setting `RESERVADA` in Compass) |
| 5 | Routes + mounting + protection by role; full Postman pass; Pull Request A | No token `401`, wrong role `403` | ✅ Merged (PR #28) |

### Phase B — Catalog, owner view and fixtures

Reordered on 2026-11-12, after `propietarios` was merged (PR #27): fixtures come before the catalog and the owner view, so both can be tested with real data.

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| B0 | `Propiedad.deleteMany({})` in `seed.js` (missing since phase A) | `make seed` leaves `propiedades` empty | ✅ (checked in a temporary database: 1 → 0) |
| B1 | Resolve the four `TODO`s: check that `propietarioId` exists and is active on create; `populate("propietarioId")` in list, get and update | Nonexistent or inactive owner `400`; owner data visible to executives | ✅ (inexistent, inactive and invalid owner `400`; active `201`; `nombre email telefono` populated in list, get and update) |
| B2 | Fixtures: ~10 properties, at least one per state; link the `propietario@gup.cl` user to its `Propietario` (`usuarios.propietarioId`) | `make seed` loads them | ✅ (11 properties, all states, 0 null references, repeatable; owner account linked; written by the agent on request) |
| B3 | Public catalog: only `PUBLICADA` + `activo`, filters (comuna, tipo, price range, bedrooms, bathrooms), never the owner's data (RNF-08) | Filters work; reserved properties hidden | ⬜ |
| B4 | Owner's "my properties": filter by the logged-in user's `propietarioId` (RNF-07) | Owner sees only theirs; another owner's property `404` | ⬜ |
| B5 | Full Postman pass; Pull Request B | Happy path and error cases | ⬜ |

## Endpoints

The whole `/api/propiedades` router is protected with `verificarToken` + `permitirRoles("EJECUTIVO")`. The public catalog and the owner view will live in other routes (phase B).

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `POST` | `/api/propiedades` | `EJECUTIVO` | `201` (always `DISPONIBLE`, `ejecutivoId` from the token, `estado`/`ejecutivoId`/`activo` in the body ignored); missing fields or invalid values `400`; nonexistent or inactive type `400`; no token `401`; other role `403` |
| `GET` | `/api/propiedades` | `EJECUTIVO` | `200`: all active properties, newest first, `tipoId` and `ejecutivoId` populated; optional `?estado=` and `?ejecutivoId=`; invalid `ejecutivoId` `400` |
| `GET` | `/api/propiedades/:id` | `EJECUTIVO` | `200`; nonexistent or soft-deleted `404`; invalid id `400` |
| `PUT` | `/api/propiedades/:id` | `EJECUTIVO` | `200`: only the fields sent change; `estado`, `ejecutivoId`, `propietarioId` and `activo` are ignored; `direccion` must be sent complete; invalid values `400`; nonexistent or inactive type `400`; nonexistent or soft-deleted `404` |
| `DELETE` | `/api/propiedades/:id` | `EJECUTIVO` | `200`: soft delete (`activo: false`) + bitacora `ELIMINACION`; `RESERVADA` or `ARRENDADA` `409`; nonexistent or already deleted `404`; invalid id `400` |
| `PATCH` | `/api/propiedades/:id/estado` | `EJECUTIVO` | Body `{ estado, observacion? }`. `200` + bitacora `CAMBIO_ESTADO`; unknown state `400` (lists the valid ones); `RESERVADA` as target `409` (only by approving a request); transition not in `TRANSICIONES` `409` (`No se puede pasar de X a Y`); nonexistent or deleted `404`; invalid id `400` |

## Decisions

- **Only `EJECUTIVO` creates, edits and changes the state of properties.** The spec's use case matrix gives "CU3 Administrar propiedades" only to the executive, and its API table lists `/propiedades` for the executive. `ADMIN` manages users and views reports.
- **`ejecutivoId` is the logged-in executive** (`req.usuario._id`), never taken from the body. It satisfies RN-15 (every property has a responsible executive) without letting anyone assign a property to an arbitrary user. Reassignment is out of scope for now. *(pending professor validation: spec §13 question 6, manual, automatic or by comuna)*
- **Executives see all active properties, not only their own** (optional filters `?estado=` and `?ejecutivoId=`). The spec says executives manage properties, not "their" properties, so one executive can cover or review another's work. *(pending professor validation)*
- **`propietarioId` cannot be edited with `PUT`.** Changing the owner moves the property, and its visits and requests history, from one owner's view to another's (RNF-07), so it is not a plain form field. If a wrong owner was chosen, the case is handled separately later. Editable fields: `titulo`, `tipoId`, `direccion` (sent complete), `superficie`, `dormitorios`, `banos`, `estacionamientos`, `valorArriendo`, `gastosComunes`, `caracteristicas`, `imagenes`, `destacada`. *(pending professor validation)*
- **Soft delete is blocked for `RESERVADA` and `ARRENDADA` properties** (`409`): an approved request or a tenant depends on them. The executive first releases the reservation or ends the contract. *(pending professor validation)*
- **Deleting a property is logged in `bitacora`** with the new action `ELIMINACION` (RNF-12: relevant operations, not only state changes). `estadoAnterior` and `estadoNuevo` are both the current `estado`, because what changes is `activo`.
- **A new property is always `DISPONIBLE`.** The controller ignores any `estado` in the body (same idea as `rol` in register, rule 17). `estado` changes only through `PATCH /:id/estado`, which applies the transition table.

## Where we left off (step 3a, `actualizarPropiedad`)

**Resumed and finished on 2026-11-09.** Kept for reference. Commits so far: model, create, routes, list and get (`99d4fad`). Working tree clean.

- **Decision taken (2026-11-09):** `propietarioId` is not editable (see *Decisions*).
- **Planned design:** `PUT /api/propiedades/:id` (the spec's API table uses `PUT`); fields not sent stay unchanged. Whitelist with destructuring; if `tipoId` is sent, check it exists and is active (`400`); `findOneAndUpdate({ _id, activo: true }, cambios, { returnDocument: "after", runValidators: true })` with the same two `populate`s; `null` → `404`; `ValidationError`/`CastError` → `400`. No bitacora entry: editing data is not a state change (RN-13).
- **Mongoose 9.10.4 behaviour, verified in the container on a throwaway document:**
  - `{ new: true }` is **deprecated**; use `returnDocument: "after"`.
  - **Updates skip schema validation by default**: without `runValidators: true`, `valorArriendo: 0` was saved. With it, `-5` → `ValidationError`.
  - Fields that are `undefined` are **ignored** in an update (the old value stays), so the destructured whitelist can be passed directly.
  - An embedded object is **replaced as a whole**: sending `{ direccion: { comuna } }` drops `calle` and `ciudad` → `ValidationError`. So `direccion` must be sent complete (document it in the endpoint).
- **Next after 3a:** 3b soft delete (`DELETE /:id` → `activo: false`), then step 4 (state machine).

## Coordination with other models

- **`propietarios` (Santiago, ✅ merged PR #27, TODOs resolved in step B1):** `propietarioId` references `Propietario`. Until his model was merged, **never `populate("propietarioId")`**: it throws `MissingSchemaError` (checked in the container). Three `TODO`s in `propiedad.controller.js` mark where to add the check and the populate. Declared with `ref: "Propietario"` before his model exists; the fixtures (step 8) and the owner view (step 7) wait for his merge. Owner fixtures should be created by him; properties then use their `_id`.
- **`solicitudesArriendo` (Roberto):** `RESERVADA` is reached **only** by approving a request, and releasing a reservation moves the property back. Those changes happen in his controller; agree on how he updates the property's `estado` (and logs it in `bitacora`).
  - **2026-11-09, review of his PR (`feature/roberto/rental-requests`):** he uses `estado`, `ejecutivoId`, the model name `"Propiedad"` and `PUBLICADA`/`RESERVADA`, all matching this model. He loads `Propiedad` lazily with `mongoose.model("Propiedad")` until this model is merged; after phase A he should switch to a normal `import`. Review asked for: no `clienteId` from the body, no `ADMIN` in CU9 routes, client cancels only from `PENDIENTE`, `activo: true` when reading the property, `required` on `estado`. Suggested to merge after this phase A and `clientes` (Jose), so it can be tested.
  - **Consequence for step 4 (done):** `PATCH /:id/estado` rejects `RESERVADA` as a target and does not allow `RESERVADA` → `DISPONIBLE`/`PUBLICADA`; releasing is his flow. After phase A is merged, he should replace `mongoose.model("Propiedad")` with `import Propiedad from "../models/Propiedad.js"`.
- **`visitas` (Ignacio):** visits only on `PUBLICADA` properties (RN-16); his controller reads the property's `estado` and copies its `ejecutivoId` (D10).

## Proposals for AGENTS.md

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-03 | Created the branch and this file; plan split in two phases; step 0 (context). | Step 1: model. |
| 2026-11-08 | Step 1: model with embedded `direccion`/`imagenes`, 6-state enum, `min` rules (0 allowed only where it is a real value), 2 indexes. | Step 2: create property. |
| 2026-11-08 | Step 2: `crearPropiedad` (whitelist against mass assignment, type check, save **then** bitacora), executive-only router, `listarPropiedades` (filters `estado`/`ejecutivoId`) and `obtenerPropiedad` (`404` vs `400`). Learned: `populate` of a model that does not exist yet throws `MissingSchemaError`. 15 Postman tests passed. | Step 3a: update. |
| 2026-11-09 | Step 3a explained (PUT vs PATCH, `findOneAndUpdate` options, `runValidators`, embedded objects replaced whole). Paused for a review task. | Resume: answer the `propietarioId` decision and write `actualizarPropiedad`. |
| 2026-11-09 | Reviewed Roberto's PR. Step 3a done: `propietarioId` not editable; `actualizarPropiedad` with `findOneAndUpdate` + `returnDocument`/`runValidators`; 7 Postman tests passed. | Step 3b: soft delete. |
| 2026-11-09 | Step 3b: `ELIMINACION` added to the bitacora enum (own commit); `eliminarPropiedad` with `findOne` → checks → `save` → bitacora; 7 Postman tests passed. | Step 4: state machine. |
| 2026-11-10 | Step 4: `TRANSICIONES` table (DATA_MODEL 6.1 minus the three transitions owned by rental requests) and `cambiarEstadoPropiedad` (code given by the agent on request, explained block by block); 15 Postman tests passed. Phase A complete. | Pull Request A. Then phase B (catalog). |
| 2026-11-12 | Phase B started on `feature/deyby/propiedades-catalogo`; plan reordered now that `propietarios` is merged. Step B0: `Propiedad.deleteMany({})` added to the seed (written by the agent on request), checked in a temporary database. | Step B1: owner check and `populate`. |
| 2026-11-12 | Step B1: owner check on create (same pattern as the type check) and `populate("propietarioId", "nombre email telefono")` in list, get and update; JSDoc updated. Learned: Mongoose drops `undefined` from a filter, so `findOne({ _id: undefined, activo: true })` matches any active owner; the `required` on `propietarioId` is what still returns `400`. | Step B2: property fixtures. |
| 2026-11-12 | Step B2 (written by the agent on request): `data/propiedades.js` with 11 properties referring to type, owner and executive by name, RUT and email; `seed.js` translates them into `_id` values with `mapaDeIds`/`buscarId` (clear error on a typo), and links `propietario@gup.cl` to Jorge Muñoz. Only new blocks appended to the seed, so teammates' lines are untouched. Checked in a temporary database. | Developer runs `make seed`; then step B3: public catalog. |
