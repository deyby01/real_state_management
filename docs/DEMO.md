# Demo script — Integrated project presentation

> **For:** the presentation of the integrated project to the professor (2026-11-21).
> **Goal:** show that the React frontend and the Express + MongoDB API work together for every actor of the case, and that the business rules live in the backend.
> **Length:** about 15 minutes. Each act names who presents it, what to click and which rule it proves.

---

## Before starting (10 minutes before)

```bash
git checkout development && git pull origin development
make up
make seed
```

- Open **`http://localhost:5173`** (not `127.0.0.1`: CORS only allows `localhost`).
- Every seed user has the password **`Password123`**.
- `make seed` restarts the data: run it again if a rehearsal changed something.
- Keep a second tab with MongoDB Compass (`mongodb://localhost:27017`, database `real_estate`) only if the professor asks to see the data.

| Role | Email | Name |
|---|---|---|
| Visitor | (no session) | — |
| `CLIENTE` | `cliente@gup.cl` | Ana Pérez |
| `EJECUTIVO` | `ejecutivo1@gup.cl` | Carla Rojas |
| `PROPIETARIO` | `propietario@gup.cl` | Jorge Muñoz |
| `ADMIN` | `admin@gup.cl` | Admin GUP |

The demo follows **one property from start to end**: **"Departamento con terraza en Ñuñoa"** (owner Jorge Muñoz, executive Carla Rojas).

---

## Act 1 — The visitor (public site) · ~2 min

| Step | Click | What to say | Rule |
|---|---|---|---|
| 1 | Home page | The showcase and the featured block come from the API (`GET /api/catalogo`), not from mock data. | RF5 |
| 2 | Search box: type **Departamento**, comuna **Ñuñoa** → Buscar | The search opens the catalog with the filters in the URL: it can be shared and the back button works. | RF5 |
| 3 | Catalog: change the price range, then set **min > max** | The error comes from the API (`400`): validation lives in the backend. | RNF |
| 4 | Open **"Departamento con terraza en Ñuñoa"** | Gallery, specs and price. The owner's data never reaches the page. | RN, RNF-08 |

## Act 2 — The client requests a rental · ~3 min

| Step | Click | What to say | Rule |
|---|---|---|---|
| 1 | In the detail, **Iniciar sesión** → `cliente@gup.cl` | After the login the page returns to the same property (`state.desde`). The header now shows "AP Ana" with **Mi panel / Mi perfil**. | Auth (JWT) |
| 2 | Fill **Solicitar arriendo** (income, occupation, occupants) → Enviar | The client is taken from the token, never from the form. | Rule 22, CU8 |
| 3 | **Ver mis solicitudes** | The new request appears as **Pendiente** next to her previous ones. | CU8 |
| 4 | **Mi perfil** | Account data, role and the role's shortcuts. | — |

## Act 3 — The executive manages · ~5 min

Log out and log in as `ejecutivo1@gup.cl`.

| Step | Click | What to say | Rule |
|---|---|---|---|
| 1 | Sidebar | The executive has five sections; each role sees only its own. | Use-case matrix |
| 2 | **Solicitudes** → Ana's request → **Evaluar** → **Aprobar** | Only the allowed buttons appear in each state. Approving **reserves the property** in the same operation. | CU9, RN-14 |
| 3 | **Propiedades** → the property shows **Reservada**. Try to **delete** it | The API answers `409`: a reserved property cannot be deleted. | RN, `409` |
| 4 | **Nueva propiedad**: title, type, owner (Jorge), address, rent, one image URL → Guardar. Then **Cambiar estado → Publicada** and open the public catalog | A new property is always **Disponible** and belongs to the executive of the token. Only the transitions of the state machine are offered; once **Publicada** it appears in the catalog, without the owner's data. | CU3, CU4, RN-01, RN-03, RN-15 |
| 5 | **Visitas** → note the date and time of a **Solicitada** visit of "Departamento luminoso cerca del metro" → **Nueva visita** for that same property and time | The API rejects the overlap for the same executive (`409`). Then confirm the pending visit. | RN-10, CU7 |
| 6 | **Clientes** / **Propietarios** → create one with an existing RUT | Duplicate RUT → `409`; the RUT is normalized (dots, `k`/`K`). | RN-11 |

## Act 4 — The owner and the admin · ~2 min

| Step | Click | What to say | Rule |
|---|---|---|---|
| 1 | Log in as `propietario@gup.cl` → **Mis propiedades** | Jorge sees only his properties; the one Ana requested now shows **Reservada**, with the executive in charge. | RNF-07 |
| 2 | Back in the public catalog, the property is **gone** | Only `PUBLICADA` properties are public. | RN-02 |
| 3 | Log in as `admin@gup.cl` → **Bitácora** | The whole story, newest first: Ana's request, Carla's evaluation, the reservation of the request and of the property, the visit. The log cannot be edited or deleted. | RN-13, rule 12 |

## Act 5 — Close · ~1 min

- **Security is in the backend:** try `/panel/propiedades` as the client → redirected; the API would answer `403` anyway.
- **Architecture:** React (pages → services → `apiFetch`) · Express MVC (routes → middlewares → controllers → models) · MongoDB. CORS only for the frontend origin.
- **Team:** one model per person, with its backend and its screens (see `MEMORY.md → Model assignments`).

---

## Known limits (say them before the professor asks)

| Topic | Status |
|---|---|
| Registration form | Visual only: the API stores name, email and password, and a new account is not linked to a client record. Seed accounts are used. Planned after the presentation. |
| Contact form, Google/Apple login, "Recuérdame" | Visual only. |
| Client books a visit | The executive books it today; the client endpoints are the next step. |
| RUT check digit (módulo 11) and RUT without hyphen | Format is checked in the client form; full validation in the API is pending (decision for the professor). |

## If something fails during the demo

| Symptom | Fix |
|---|---|
| "No se pudo conectar con el servidor" | The backend is down: `make up`, then `make logs-back`. |
| Requests blocked by CORS | The page was opened at `127.0.0.1`: use `localhost:5173`. |
| Data looks different from this script | A rehearsal changed it: `make seed` and log in again. |
| Session lost after `make seed` | Expected: the user `_id`s changed. Log in again. |
