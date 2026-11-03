# bitacora — Bitacora

> **Owner:** Deyby · **Branch:** `feature/deyby/bitacora` · **Status:** ✅ Complete, PR pending
> **Specification:** [`docs/DATA_MODEL.md → bitacora`](../docs/DATA_MODEL.md#bitacora-audit-log)
> **Depends on:** `usuarios` (✅, `usuarioId`) · **Used by:** `propiedades` (Deyby), `visitas` (Ignacio), `solicitudesArriendo` (Roberto): they insert an entry on every state change (RN-13, RNF-12)

## Plan

`bitacora` is **insert-only** (rule 12): no update, no delete, no soft delete. So its plan differs from the template.

| # | Step | What to test | Status |
|---|---|---|---|
| 0 | Context: audit log, insert-only, `entidad` + `entidadId`, compound index, services | — | ✅ |
| 1 | Model `backend/src/models/Bitacora.js` + compound index | Index visible in Compass | ✅ (index checked with `schema.indexes()`; Compass check in step 2) |
| 2 | Service `registrarBitacora(...)`: the function other controllers call to insert an entry | Insert one entry from a temporary call; visible in Compass | ✅ (valid entry saved; `accion: "APROBAR"` rejected by the enum; index visible in Compass) |
| 3 | Controller: list entries, filtered by `entidad` / `entidadId`, newest first | `200` with the right order and filters | ✅ |
| 4 | Routes + mounting in `app.js` + protection by role | No token `401`, wrong role `403` | ✅ (whole router protected with `router.use`; 6 Postman tests passed) |
| 5 | Usage guide for teammates (in this file) + `Bitacora.deleteMany` in `seed.js` + Pull Request | `make seed` empties `bitacora` | ✅ (collection emptied, index kept); PR pending |

## How to use it from your controller

For `propiedades`, `visitas` and `solicitudesArriendo`: **every state change inserts one entry** (RN-13).

```js
import { registrarBitacora } from "../services/bitacora.service.js"

// inside your controller, AFTER saving the state change:
await registrarBitacora({
    entidad: "VISITA",                 // "PROPIEDAD" | "VISITA" | "SOLICITUD"
    entidadId: visita._id,             // the document that changed
    accion: "CAMBIO_ESTADO",           // "CREACION" | "CAMBIO_ESTADO" | "RESERVA" | "LIBERACION_RESERVA"
    estadoAnterior: "SOLICITADA",      // empty on CREACION
    estadoNuevo: "CONFIRMADA",
    usuarioId: req.usuario._id,        // set by verificarToken: who made the change
    observacion: req.body.observacion  // optional
})
```

- **Always use `await`.** Without it, a failed insert goes unnoticed and the change is left without a record.
- **Do not catch its errors inside the service call:** your controller's `try/catch` handles them. A `ValidationError` about `entidad` or `accion` means your code has a typo in one of those values: fix the code.
- **Do not send `fecha`:** it is set automatically.
- **Need a new `accion`?** Ask Deyby to add it to the `enum` in `Bitacora.js`; do not edit the model yourself.
- To see the history: `GET /api/bitacora?entidad=VISITA&entidadId=<id>` with an `ADMIN` token.

## Endpoints

| Method | Route | Who can use it | Responses |
|---|---|---|---|
| `GET` | `/api/bitacora` | `ADMIN` | `200` (optional filters `?entidad=` and `?entidadId=`, newest first); invalid `entidadId` `400`; no token `401`; other role `403` |

No `POST`, `PUT` or `DELETE` endpoints: entries are only created by the backend itself, through the service.

## Decisions

- Only `ADMIN` can read the log (demo step 8 of DATA_MODEL). *(pending professor validation)*
- **No `timestamps`**, a documented exception to the project convention: an insert-only document is never updated, so `updatedAt` would be meaningless. The `fecha` field (default: now) records when the entry was created, as DATA_MODEL defines.
- **No `activo` field:** entries are never deleted, not even with soft delete (rule 12).
- `accion` and `entidad` are closed `enum`s, so a typo (`"cambio_estado"`) is rejected instead of being stored. Values: `entidad` = `PROPIEDAD`, `VISITA`, `SOLICITUD`; `accion` = `CREACION`, `CAMBIO_ESTADO`, `RESERVA`, `LIBERACION_RESERVA`. A teammate who needs a new action asks Deyby to add it to the `enum`.

## Coordination with other models

- Ignacio (`visitas`) and Roberto (`solicitudesArriendo`) will call `registrarBitacora`. Its signature must be documented here before they need it.

## Proposals for AGENTS.md

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-02 | Created the branch and this file; step 0 (context and concepts). | Step 1: model. |
| 2026-11-02 | Steps 1–2: model with compound index and `registrarBitacora` service, tested from the container. | Step 3: controller. |
| 2026-11-03 | Steps 3–5: controller with filters, `sort` and `populate`; admin-only router; 6 Postman tests passed; `seed.js` empties `bitacora`; usage guide for teammates. | Pull Request to `development`. |
