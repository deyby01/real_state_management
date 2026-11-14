# memory/ — One memory file per model

> **What this folder is:** each model of [`docs/DATA_MODEL.md`](../docs/DATA_MODEL.md) has **one file here**. It holds that model's plan, progress, decisions, open questions and session log.
> **Why it exists:** several teammates work at the same time, each one with an AI agent. If every agent wrote in `MEMORY.md`, every Pull Request would have conflicts in the same lines. With one file per model, **each file has a single owner** and nobody edits someone else's file, so there are no conflicts.
> **Rules for the agent:** see [`AGENTS.md → Shared memory`](../AGENTS.md#shared-memory-who-edits-what).

---

## Who edits what

| File | Who edits it | When |
|---|---|---|
| `AGENTS.md` | **Only the integrator (Deyby)** | When a rule changes or a proposed lesson is accepted |
| `MEMORY.md` | **Only the integrator (Deyby)** | After merging a Pull Request: status table, endpoints, assignments |
| `memory/<collection>.md` | **Only the owner of that model** | During every session working on the model |
| `memory/README.md` (this file) | Only the integrator | When the template changes |

Every agent **reads** all the files. Each agent **writes** only in its developer's model file.

---

## Files

| File | Model | Owner | Status |
|---|---|---|---|
| [`usuarios.md`](usuarios.md) | `Usuario` + authentication (JWT, roles) | Deyby | ✅ Merged (PR #20) |
| [`tiposPropiedad.md`](tiposPropiedad.md) | `TipoPropiedad` | Deyby | ✅ Merged (PR #19) |
| [`bitacora.md`](bitacora.md) | `Bitacora` + `registrarBitacora` service | Deyby | ✅ Merged (PR #22) |
| [`propietarios.md`](propietarios.md) | `Propietario` | Santiago | ✅ Merged (PR #27) |
| [`clientes.md`](clientes.md) | `Cliente` | Jose | ✅ Merged (PR #25) |
| [`propiedades.md`](propiedades.md) | `Propiedad`: management API and state machine | Deyby | ✅ Merged (PR #28, PR #33, PR #36) |
| [`solicitudesArriendo.md`](solicitudesArriendo.md) | `SolicitudArriendo`: rental requests and reservation | Roberto | ✅ Merged (PR #24) |

New files are created by the owner of the model when starting to work on it, by copying the template below. The full assignment table lives in [`MEMORY.md → Model assignments`](../MEMORY.md#model-assignments).

---

## Template

Copy this into `memory/<collection>.md` (for example `memory/propietarios.md`) and fill it in. Keep it short: the details of the fields are in `docs/DATA_MODEL.md`, do not copy them here.

```markdown
# <collection> — <Model>

> **Owner:** <name> · **Branch:** `feature/<name>/<short-description>` · **Status:** 🚧 In progress
> **Specification:** [`docs/DATA_MODEL.md → <collection>`](../docs/DATA_MODEL.md#5-collections-in-detail)
> **Depends on:** <models it references, e.g. `usuarios` (merged)> · **Used by:** <models that will reference it>

## Plan

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | Context: read the model in DATA_MODEL, concepts and libraries | — | ⬜ |
| 1 | Model `backend/src/models/<Model>.js` | Fields, validations and indexes visible in Compass | ⬜ |
| 2 | Controller: list and get by id | `200`, `404` | ⬜ |
| 3 | Controller: create and update (with business rules) | `201`, `400`, `409` | ⬜ |
| 4 | Controller: soft delete (`activo: false`) | Record still in Compass with `activo: false` | ⬜ |
| 5 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ⬜ |
| 6 | Fixtures in `backend/src/fixtures/data/` + `seed.js` | `make seed` loads the data | ⬜ |
| 7 | Full Postman pass + Pull Request (description from `.github/pull_request_template.md`) | Happy path and error cases | ⬜ |

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|

## Decisions

- <decision> — <why>. *(pending professor validation, if applicable)*

## Coordination with other models

- <what this model needs from another one, who owns it and what was agreed>

## Proposals for AGENTS.md

- <a mistake or lesson the agent learned, for the integrator to review>

## Session log

| Date | What was done | Result / next step |
|---|---|---|
```

---

## Status icons

✅ done · 🚧 in progress · ⬜ not started · ⏸️ blocked (say why in the file)
