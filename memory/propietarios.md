# propietarios — Propietario

> **Owner:** Santiago · **Branch:** `feature/santiago/modelo-propietario` · **Status:** PR #27 open; both mandatory review fixes implemented and tested
> **Specification:** [`docs/DATA_MODEL.md → propietarios`](../docs/DATA_MODEL.md#propietarios-property-owners)
> **Depends on:** No model references · **Used by:** `usuarios`, `propiedades`

## Plan

| # | Step | What to test | Status |
|---|---|---|---|
| 0 | Context: MVC, schema/model/collection, references, required/default/unique | Explain the concepts with existing models | ✅ |
| 1 | Model `backend/src/models/Propietario.js` | Validation, normalization and unique RUT index | ✅ Validation and database duplicate enforcement verified |
| 2 | Controller: list and get by id | `200`, `404` | ✅ |
| 3 | Controller: create and update | `201`, `400`, `409` | ✅ |
| 4 | Soft delete | Document retained with `activo: false` | ✅ |
| 5 | Routes, mounting and role protection | `401`, `403` | ✅ All five routes tested |
| 6 | Fixtures and seed integration | Test data loads | ✅ Actual seed run in isolated database |
| 7 | Postman and Pull Request | Happy path and errors | 🚧 Automated HTTP pass complete; PR opened, manual screenshots not confirmed |

## Current next step

RUT fix committed as 0cdf21b. Santiago replaced repeated route middleware with a single propietarioRouter.use(verificarToken, permitirRoles("EJECUTIVO")); all five routes remain below it with no repeated middleware. 25 isolated HTTP checks passed: each route rejects missing tokens (401) and ADMIN/CLIENTE/PROPIETARIO (403), while EJECUTIVO can create (201), list, read, update and soft-delete (200). Temporary database removed. Next: commit the router and memory, integrate updated development, collect Postman screenshots and push for re-review.

Review checked on 2026-11-12 against GitHub PR #27 and the local files. Santiago added toUpperCase() to the RUT setter. Five isolated HTTP checks passed: lowercase k creates a canonical uppercase K (201), uppercase duplicate returns 409, another owner creates successfully (201), updating it to the same lowercase-k RUT returns 409, and null RUT still returns 400. Temporary database removed. Next: commit the model and this memory, then protect the whole router with router.use and remove per-route middleware repetition in a separate tested commit. Add successful/error Postman screenshots and request re-review. Optional format validation and semicolon style are not merge blockers; do not rewrite published history.

Fetched origin/development at 245a85b: clients PR #25 and documentation PR #31 are merged. New AGENTS rules require router-wide protection for uniform permissions, use-case-based roles, business states outside body whitelists, and active-only updates/deletes. The developer must merge the new development into this branch, preserving both owner and client additions in app.js, seed.js and fixture documentation. Fetch alone did not change the working branch.

Santiago opened the PR and merged the newer development changes (through 91b3cee) into his feature branch. The app.js conflict was resolved by preserving both propiedad and propietario routers. The feature branch was clean and synchronized with its remote before the current documentation step. English JSDoc now documents all five owner controller functions; the model header links to DATA_MODEL and comments explain RUT normalization and soft deletion. Next: commit and push this focused documentation change, then address PR review feedback.

44 HTTP checks passed against an isolated MongoDB database, including actual seed loading, all route permissions, required fields, invalid/missing IDs, normalized RUT duplicates on create/update, field allowlisting, update validation, soft-delete persistence and exclusion of inactive owners. Three targeted HTTP checks passed after switching to returnDocument: "after". Temporary databases were removed; the developer database was not seeded or reset.

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| GET | `/api/propietarios` | EJECUTIVO | `200` active-owner array, `401` without token, `403` wrong role, `500` unexpected errors |
| POST | `/api/propietarios` | EJECUTIVO | `201` created, `400` invalid data, `409` duplicate RUT, `401`/`403` authentication/role, `500` unexpected errors |
| GET | `/api/propietarios/:id` | EJECUTIVO | `200`, `400` invalid ID, `404` absent/inactive |
| PUT | `/api/propietarios/:id` | EJECUTIVO | `200`, `400` invalid ID/data or no editable fields, `404` absent/inactive, `409` duplicate RUT |
| DELETE | `/api/propietarios/:id` | EJECUTIVO | `200` with message and inactive owner, `400` invalid ID, `404` absent/already inactive |

All routes return `401` without a token, `403` for CLIENTE, PROPIETARIO or ADMIN, and `500` on unexpected failures. Santiago verified the listing manually with an executive login token; remaining manual Postman evidence is pending.

## Decisions

- Follow the student-led teaching loop, one field at a time.
- Owner listing is restricted to EJECUTIVO, following the specification's owner administration responsibility; reuse existing auth and role middleware.
- Follow DATA_MODEL: required, unique, normalized RUT; required name and email; optional phone; active by default. All fields are implemented; RUT normalization uses a type-guarded setter.
- Santiago explicitly requested completion of controllers, routes and fixtures.
- PUT changes only supplied `rut`, `nombre`, `email`, `telefono` fields; omitted fields remain unchanged. Empty or unsupported-only bodies return 400. `activo` and `_id` cannot be changed through this operation.
- Updates use `runValidators: true` and `returnDocument: "after"`. Active-only query filters also prevent updating inactive records. DELETE performs a soft delete; repeated deletion returns 404.
- Fixtures provide two active and one inactive fictional owner. Linking login accounts remains Deyby's responsibility.

## Coordination with other models

- Deyby owns `usuarios`: account creation and linking through `usuarios.propietarioId` must be coordinated with him. Owner business records are separate from login accounts.

## Proposals for AGENTS.md

- 2026-11-12: The owner normalization and tests covered punctuation but missed the k/K check digit variants. Normalize letter case before unique-index enforcement and include case variants in duplicate tests, as identified by Deyby's PR #27 review.


- 2026-11-09: A PowerShell `node -e` check lost embedded quotes. Use a single-quoted here-string piped to `node --input-type=module` for multiline JavaScript checks on Windows.
- 2026-11-09: The agent suggested a setter calling `replaceAll` without guarding null/undefined. Guard string transformations so missing values reach the required validator instead of causing a cast error. Prefer async `validate()`; the installed Mongoose warns that `validateSync()` is deprecated.
- 2026-11-10: Initial update implementation used deprecated `new: true`. Replaced it with `returnDocument: "after"` after the installed Mongoose warning, and reverified update/delete responses.

## PR draft (finalize after developer rebase and screenshots)

**Title:** `feat: add owner model, controller, routes and fixtures`

### Description

Adds the Propietario MVC flow for executive-managed owner records, with normalized unique RUTs, validated updates and soft deletion. Includes test fixtures and per-model progress documentation.

### Type of change

- [x] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Styles / markup (style)
- [x] Documentation (docs)
- [ ] Refactor

### Changes made

- Model: `backend/src/models/Propietario.js`.
- Controller: `backend/src/controllers/propietario.controller.js` (list, detail, create, update, soft delete).
- Routes: `backend/src/routes/propietario.routes.js`; router mounted in `backend/src/app.js`.
- Fixtures: `backend/src/fixtures/data/propietarios.js`, `backend/src/fixtures/seed.js`, `backend/src/fixtures/README.md`.
- Memory: `memory/propietarios.md`.

### Screenshots

Pending: attach Postman evidence for creation/listing and an error case (duplicate RUT or forbidden role).

### Checklist

- [ ] I pulled `development` and rebased my branch before opening this PR
- [x] My branch follows the `feature/name-user/name-of-implementation` convention
- [ ] I checked the site on both desktop and mobile (N/A: backend only)
- [x] I left no commented-out code or forgotten `console.log` (seed progress logs are intentional)
- [ ] My commits follow the convention (`feat:`, `fix:`, `docs:`...)

### Notes for the reviewer

47 HTTP checks passed in temporary databases, covering the real seed, permissions, validation, duplicate RUTs, updates and persistent soft deletion. Review active-only filtering and editable field allowlisting. Coordinate account linking through `usuarios.propietarioId` with Deyby; fixtures intentionally do not modify users. Review the lessons proposed in this memory file. Manual screenshots, commits and rebase are still pending.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-12 | Confirmed RUT commit 0cdf21b, reviewed Santiago's saved router.use refactor, and ran 25 isolated HTTP permission/CRUD checks. | All passed; commit router and memory separately, then integrate development and submit review evidence. |
| 2026-11-12 | Reviewed Santiago's toUpperCase() setter change and ran five isolated HTTP checks, including k/K duplicates in POST and PUT. | All passed; commit the RUT fix and memory before the router refactor. |
| 2026-11-12 | Fetched development updates and read all PR #27 inline/general comments and reviews via GitHub API (gh is unavailable). Verified both requested changes remain absent locally. | Apply RUT uppercase and router.use in separate tested commits; integrate development, attach screenshots and request re-review. |
| 2026-11-10 | Reviewed new development documentation rules, helped resolve the app.js import conflict, and added owner model documentation plus JSDoc for all five exported controller functions at Santiago's request. | Documentation-only change; commit and push it to the existing PR after syntax/diff checks. |
| 2026-11-09 | Reviewed project concepts with Santiago and his first model field. Ran `node --check backend/src/models/Propietario.js` successfully. | `nombre` is correct; adjust indentation, then add `rut`. Database behavior has not been tested. |
| 2026-11-09 | Reviewed the added `rut` field and corrected indentation. | Student must change `Unique` to `unique`; normalization and remaining fields are pending. |
| 2026-11-09 | Verified `unique` correction and reviewed the RUT setter attempt. | Change `replaceALL` to `replaceAll` (JavaScript method names are case-sensitive). Setter behavior and missing/null inputs still need validation. |
| 2026-11-09 | Verified the setter now uses `replaceAll`. | Continue with `email`; full model validation remains pending. |
| 2026-11-09 | Reviewed the student's `email` field; options are correct. | Next: optional `telefono`, then `activo`. |
| 2026-11-09 | Added optional `telefono` with `String` and `trim` at Santiago's request. | Next: `activo`. |
| 2026-11-09 | Reviewed `activo`; all fields are present and `node --check` passed. Attempted runtime validation, blocked by missing host Mongoose and unavailable Docker Engine. | Start Docker for validation; no database writes performed. |
| 2026-11-09 | Ran in-container model validation after Docker startup, without connecting to MongoDB or writing data. | Normalization/defaults work; improve setter handling of null/undefined, then retest. Unique index declaration exists. |
| 2026-11-10 | Added the RUT setter type guard at Santiago's request. Ran async validation with assertions in Docker. | Dotted RUT normalizes; omitted, undefined, null and empty RUT fail required. All checks passed without database writes. |
| 2026-11-10 | Santiago confirmed controller and routes are in scope. | Explain the controller and guide the first listing function; no controller code written yet. |
| 2026-11-10 | Implemented `getPropietarios` at Santiago's explicit request in his empty controller file, following TipoPropiedad. Syntax check passed. | Next: explain and connect a protected listing route; Postman and database checks remain pending. |
| 2026-11-10 | Completed imports in Santiago's existing route file and mounted the router at his request. HTTP checks passed for 401/403/200 against MongoDB. | Listing route works; next: owner creation and duplicate RUT testing. |
| 2026-11-10 | Santiago obtained an executive login token and reported `[]` from GET in Postman. Implemented `postPropietario` at his request; syntax check passed. | POST route and runtime creation/error verification pending. |
| 2026-11-10 | Mounted protected POST route. Isolated MongoDB HTTP checks passed: 401, 403, 400 (empty body and null RUT), 201, 409 (same normalized RUT), GET 200 with created owner. Temporary database removed. | Model and creation verified; manual POST evidence and remaining CRUD operations next. |
| 2026-11-10 | Completed get by ID, validated update, soft delete, protected routes and fixtures at Santiago's request. 44 isolated HTTP checks and actual seed passed; 3 targeted checks passed after adopting returnDocument. | Implementation complete; manual evidence and developer Git/PR steps pending. |
