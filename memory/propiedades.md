# propiedades — Propiedad

> **Owner:** Deyby · **Branch:** `feature/deyby/propiedades` · **Status:** 🚧 In progress
> **Specification:** [`docs/DATA_MODEL.md → propiedades`](../docs/DATA_MODEL.md#propiedades-the-center-of-the-model), [state machine 6.1](../docs/DATA_MODEL.md#61-property)
> **Depends on:** `tiposPropiedad` (✅), `usuarios` (✅, `ejecutivoId`), `bitacora` (✅), `propietarios` (Santiago, not merged yet) · **Used by:** `visitas` (Ignacio), `solicitudesArriendo` (Roberto), the public catalog and the landing page

## Plan

This is the largest model, so it is split into **two phases**, each one with its own Pull Request. Phase A gives Ignacio and Roberto a merged `Propiedad` to reference as early as possible.

### Phase A — Model, management and states

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: embedded subdocuments, several references, `estado` vs `activo`, state machine | — | 🚧 |
| 1 | Model `backend/src/models/Propiedad.js`: embedded `direccion` and `imagenes`, three references, `estado` enum, indexes | Fields and indexes in Compass | ⬜ |
| 2 | Controller: create (always `DISPONIBLE`, bitacora `CREACION`), list and get by id | `201`, `200`, `404`, invalid id `400` | ⬜ |
| 3 | Controller: update data (never `estado`) and soft delete | `200`; record kept with `activo: false` | ⬜ |
| 4 | Controller: `PATCH /:id/estado` with the transition table + bitacora `CAMBIO_ESTADO` | Allowed `200`; not allowed `409`; `RESERVADA` as target `409` | ⬜ |
| 5 | Routes + mounting + protection by role; full Postman pass; Pull Request A | No token `401`, wrong role `403` | ⬜ |

### Phase B — Catalog, owner view and fixtures

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 6 | Public catalog: only `PUBLICADA` + `activo`, filters (comuna, tipo, price range, bedrooms, bathrooms), never the owner's data | Filters work; reserved properties hidden | ⬜ |
| 7 | Owner's "my properties": filter by the logged-in user's `propietarioId` | Owner sees only theirs; another owner's property `404` | ⬜ |
| 8 | Fixtures: ~10 properties, at least one per state | `make seed` loads them | ⬜ |
| 9 | Full Postman pass; Pull Request B | Happy path and error cases | ⬜ |

Phase B steps 7 and 8 need the `Propietario` model merged (Santiago).

## Endpoints

*(filled in as they are built)*

| Method | Route | Who can use it | Responses |
|---|---|---|---|

## Decisions

- **Only `EJECUTIVO` creates, edits and changes the state of properties.** The spec's use case matrix gives "CU3 Administrar propiedades" only to the executive, and its API table lists `/propiedades` for the executive. `ADMIN` manages users and views reports.
- **`ejecutivoId` is the logged-in executive** (`req.usuario._id`), never taken from the body. It satisfies RN-15 (every property has a responsible executive) without letting anyone assign a property to an arbitrary user. Reassignment is out of scope for now. *(pending professor validation: spec §13 question 6, manual, automatic or by comuna)*
- **A new property is always `DISPONIBLE`.** The controller ignores any `estado` in the body (same idea as `rol` in register, rule 17). `estado` changes only through `PATCH /:id/estado`, which applies the transition table.

## Coordination with other models

- **`propietarios` (Santiago):** `propietarioId` references `Propietario`. Declared with `ref: "Propietario"` before his model exists; the fixtures (step 8) and the owner view (step 7) wait for his merge. Owner fixtures should be created by him; properties then use their `_id`.
- **`solicitudesArriendo` (Roberto):** `RESERVADA` is reached **only** by approving a request, and releasing a reservation moves the property back. Those changes happen in his controller; agree on how he updates the property's `estado` (and logs it in `bitacora`).
- **`visitas` (Ignacio):** visits only on `PUBLICADA` properties (RN-16); his controller reads the property's `estado` and copies its `ejecutivoId` (D10).

## Proposals for AGENTS.md

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-03 | Created the branch and this file; plan split in two phases; step 0 (context). | Step 1: model. |
