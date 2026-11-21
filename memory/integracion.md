# integracion — Frontend integration (React ↔ API)

> **Owner:** Deyby (integrator) · **Base:** merged (PR #39) · **Status:** ✅ Phase 1 merged for every teammate (2026-11-20)
> **Rules:** [`AGENTS.md → Frontend structure (React)`](../AGENTS.md#frontend-structure-react). **Endpoints:** [`MEMORY.md → Existing backend endpoints`](../MEMORY.md#existing-backend-endpoints).
> **Who edits this file:** only the integrator. Each teammate records their progress in a **`## Frontend integration`** section of their **own** `memory/<collection>.md` (plan table + session log), not here.

---

## How it works

The professor asked for **CORS only** (no Vite proxy, no new dependencies). The integration is done in two phases:

1. **Phase 0 — base (Deyby, merged in PR #39).** Everything the screens need is shared and ready:

   | Piece | File | What it gives you |
   |---|---|---|
   | CORS | `backend/src/app.js` (`CORS_ORIGIN`) | The browser at `http://localhost:5173` can call the API at `http://localhost:4000/api` |
   | API URL | `docker-compose.yml`, `frontend-react/.env.example` (`VITE_API_URL`) | Base URL of the API |
   | API client | `frontend-react/src/services/api.js` | `apiFetch(ruta, { method, body, params })`, `ApiError` (`message`, `status`, `datos`), token in `localStorage` |
   | Reference service | `frontend-react/src/services/auth.service.js` | One function per endpoint; copy its shape |
   | Session | `frontend-react/src/context/AuthContext.jsx` | `const { usuario, cargando, login, logout } = useAuth()` |
   | Protected routes | `frontend-react/src/components/RutaProtegida.jsx` | `<RutaProtegida roles={[...]} />` as a layout route |
   | Panel | `frontend-react/src/layouts/PanelLayout.jsx`, `layouts/menuPanel.js`, `pages/panel/` | `/panel` with a sidebar by role; unfinished sections show "Sección en construcción" |
   | Reference form | `frontend-react/src/pages/LoginPage.jsx` | Controlled form, `try/catch/finally`, error box, disabled button while sending |
   | Display helpers (Phase 1) | `frontend-react/src/utils/formato.js` | `formatearPrecio`, `formatearDireccion`, `formatearFechaHora` |
   | Dialog (Phase 1) | `frontend-react/src/components/panel/Modal.jsx` | `<Modal titulo onCerrar>` for create/edit forms (Escape and click outside close it) |
   | Reference panel screen (Phase 1) | `frontend-react/src/pages/panel/PropiedadesPanel.jsx` | List with filters, table, dialogs, state buttons from a transition table, reload after every change, success/error notice. **Copy its structure** |

2. **Phase 1 — one task per teammate (in parallel).** Each teammate builds the screens of **their own model** on their own branch, following the card below. The sidebar link already exists: you only add your page and **one `<Route>` line** in `App.jsx`.

### Steps for every teammate

1. `git checkout development && git pull origin development && git checkout -b feature/<name>/integracion-<modelo>`.
2. `make up` (and `make seed` for clean data). Open **`http://localhost:5173`** (not `127.0.0.1`).
3. Read the base files above and your card. Add a `## Frontend integration` section to your `memory/<collection>.md` with your plan.
4. Build in small, tested steps, **one commit per step** (suggested order and commit messages are in each card).
5. Test every acceptance check of your card in the browser with the seed users (password `Password123`).
6. `git fetch origin && git rebase origin/development`, then open the PR with [the template](../.github/pull_request_template.md): screenshots of the screens and one error case.

### Seed users

| Role | Email | Use it to test |
|---|---|---|
| `ADMIN` | `admin@gup.cl` | Bitácora |
| `EJECUTIVO` | `ejecutivo1@gup.cl` (Carla Rojas), `ejecutivo2@gup.cl` (Matías Soto) | Propiedades, propietarios, clientes, visitas, solicitudes |
| `PROPIETARIO` | `propietario@gup.cl` (Jorge Muñoz) | Mis propiedades |
| `CLIENTE` | `cliente@gup.cl` (Ana Pérez) | Mis solicitudes, solicitar arriendo |

---

## Assignments

| Who | Task | Panel route(s) | Status |
|---|---|---|---|
| Deyby | Base (Phase 0); public property detail; catalog with filters; landing featured; registration; executive properties panel; owner's properties; audit log | `/propiedades/:id`, `propiedades`, `mis-propiedades`, `bitacora` | ✅ Phase 0 (#39) · ✅ Phase 1: detail (#40), catalog + home + fixtures (#41), properties panel (#42), owner view + audit log (#43), profile and session menu (#44). Create property (F4b) done after the merges; registration is technical debt |
| Santiago | Owners panel (executive) | `propietarios` | ✅ PR #48 |
| Jose | Clients panel (executive) | `clientes` | ✅ PR #46 |
| Ignacio | Visit schedule (executive); later the client's "Agendar visita" | `visitas` | ✅ PR #45 (executive panel) · ⬜ client visits |
| Roberto | Rental requests: executive panel, client's list and "Solicitar arriendo" form | `solicitudes`, `mis-solicitudes` | ✅ PR #47 |

Status icons: ✅ merged · 🚧 PR open / in progress · ⬜ not started. The integrator updates this table after each merge.

---

## Task cards

### Santiago — Owners panel (`propietarios`)

- **Who uses it:** `EJECUTIVO` (CU2). Sidebar link: "Propietarios" → `/panel/propietarios`.
- **Endpoints:** `GET /propietarios`, `GET /propietarios/:id`, `POST /propietarios`, `PUT /propietarios/:id`, `DELETE /propietarios/:id`.
- **Your files:**
  - `frontend-react/src/services/propietario.service.js`: `listarPropietarios()`, `obtenerPropietario(id)`, `crearPropietario(datos)`, `actualizarPropietario(id, datos)`, `eliminarPropietario(id)`.
  - `frontend-react/src/pages/panel/PropietariosPanel.jsx`.
  - `frontend-react/src/components/propietarios/` (for example `PropietarioForm.jsx`, used for both create and edit).
  - `App.jsx`: inside the `EJECUTIVO` group → `<Route path="propietarios" element={<PropietariosPanel />} />`.
- **Screen:** table (RUT, nombre, email, teléfono, actions); "Nuevo propietario" button opens the form; "Editar" fills the same form; "Eliminar" asks `window.confirm` first, then reloads the list.
- **Acceptance checks:**
  - [ ] Carla sees the 2 active seed owners; the inactive one does not appear.
  - [ ] Create with RUT `11.111.111-1` → appears in the list with the RUT normalized by the backend.
  - [ ] Create the same RUT again as `11111111-1` → the form shows the backend's `409` message.
  - [ ] Edit the phone → list shows the new value.
  - [ ] Delete → it disappears from the list (soft delete: still in Compass with `activo: false`).
  - [ ] `cliente@gup.cl` cannot open `/panel/propietarios` (redirected to `/`).
- **Suggested commits:** `feat: add owner service` · `feat: add owners list to the panel` · `feat: add create and edit owner form` · `feat: add owner soft delete to the panel`.
- **Used by:** Deyby's property form imports `listarPropietarios()` to pick the owner. **Merge the service early** if you can.

### Jose — Clients panel (`clientes`)

- **Who uses it:** `EJECUTIVO` (CU5). Sidebar link: "Clientes" → `/panel/clientes`.
- **Endpoints:** `GET /clientes`, `GET /clientes/:id`, `POST /clientes`, `PUT /clientes/:id`, `DELETE /clientes/:id`.
- **Your files:**
  - `frontend-react/src/services/cliente.service.js`: `listarClientes()`, `obtenerCliente(id)`, `crearCliente(datos)`, `actualizarCliente(id, datos)`, `eliminarCliente(id)`.
  - `frontend-react/src/pages/panel/ClientesPanel.jsx`.
  - `frontend-react/src/components/clientes/` (for example `ClienteForm.jsx`).
  - `App.jsx`: inside the `EJECUTIVO` group → `<Route path="clientes" element={<ClientesPanel />} />`.
- **Screen:** table (RUT, nombre, email, teléfono, comuna, estado); create/edit form with `rut`, `nombre`, `email`, `telefono`, `ciudad`, `comuna` (**no `estado` field**: the backend sets it); delete with confirmation.
- **Acceptance checks:**
  - [ ] Carla sees the 3 seed clients with their `estado`.
  - [ ] Create a client → appears with `estado` `INTERESADO`.
  - [ ] Duplicate RUT or email → the backend's `409` message on the form.
  - [ ] Edit and delete work and the list reloads.
  - [ ] `propietario@gup.cl` cannot open `/panel/clientes`.
- **Suggested commits:** `feat: add client service` · `feat: add clients list to the panel` · `feat: add create and edit client form` · `feat: add client soft delete to the panel`.
- **Used by:** Ignacio's visit form imports `listarClientes()`. **Merge the service early** if you can.

### Ignacio — Visit schedule (`visitas`)

- **Who uses it:** `EJECUTIVO` (CU7). Sidebar link: "Visitas" → `/panel/visitas`.
- **Endpoints:** `GET /visitas` (filters `estado`, `desde`, `hasta`, `propiedadId`), `GET /visitas/:id`, `POST /visitas`, `PUT /visitas/:id` (reschedule), `PATCH /visitas/:id/confirmar`, `/rechazar`, `/cancelar` (optional `observacion`), `PATCH /visitas/:id/resultado` (`resultado` required).
- **Your files:**
  - `frontend-react/src/services/visita.service.js`: one function per endpoint above; filters go in `params` (`apiFetch("/visitas", { params: { estado, desde, hasta } })`).
  - `frontend-react/src/pages/panel/VisitasPanel.jsx`.
  - `frontend-react/src/components/visitas/` (for example `VisitaForm.jsx`, `AccionesVisita.jsx`).
  - `App.jsx`: inside the `EJECUTIVO` group → `<Route path="visitas" element={<VisitasPanel />} />`.
- **Screen:** list sorted by date (fecha y hora formatted with `toLocaleString("es-CL")`, propiedad `propiedadId.titulo`, cliente, estado); state filter; **only the buttons the current state allows** (`SOLICITADA`: confirmar, rechazar, cancelar, reprogramar; `CONFIRMADA`: registrar resultado, cancelar, reprogramar; terminal states: none). Form to create a visit: property (select), client (select), date and time (`<input type="datetime-local">`).
- **Backend touch-ups in your own files (allowed, you own `visitas`):** the list does not populate `clienteId`; add `.populate("clienteId", "nombre email telefono")` next to the existing populates so the table can show the client's name.
- **Dependencies:** the create form needs `listarClientes()` (Jose) and the executive's `PUBLICADA` properties (`GET /propiedades?estado=PUBLICADA`, Deyby's `propiedad.service.js`). **Build the list and the state buttons first**; do the create form when those services are merged. Do not copy their functions into your service.
- **Acceptance checks:**
  - [ ] Carla sees the seed visits with property title and client name.
  - [ ] Filter by `SOLICITADA` shows only those.
  - [ ] Confirm a `SOLICITADA` → becomes `CONFIRMADA`; the "Confirmar" button disappears.
  - [ ] Register a result on a `CONFIRMADA` → `REALIZADA`.
  - [ ] Create a visit overlapping another one of the same executive → the backend's `409` message.
  - [ ] Create a visit in the past → `400` message.
- **Suggested commits:** `feat: add visit service` · `feat: add visit schedule to the panel` · `feat: add visit state actions` · `feat: add create and reschedule visit form`.
- **Second task (after the backend follow-up PR with the `CLIENTE` visit endpoints):** "Agendar visita" component for the public property detail page (`/propiedades/:id`, Deyby), built like Roberto's `SolicitarArriendoForm`.

### Roberto — Rental requests (`solicitudes`, `mis-solicitudes`)

- **Who uses it:** `EJECUTIVO` (CU9) and `CLIENTE` (CU8). Sidebar links: "Solicitudes" (`/panel/solicitudes`) and "Mis solicitudes" (`/panel/mis-solicitudes`).
- **Endpoints:** `POST /solicitudes` (`propiedadId`, `antecedentes: { ingresosMensuales, ocupacion, numeroOcupantes, tieneMascotas }`), `GET /solicitudes`, `GET /solicitudes/:id`, `PATCH /solicitudes/:id/evaluar`, `/aprobar`, `/rechazar`, `/cancelar` (optional `observacion`).
- **Your files:**
  - `frontend-react/src/services/solicitud.service.js`.
  - `frontend-react/src/pages/panel/SolicitudesPanel.jsx` (executive) and `frontend-react/src/pages/panel/MisSolicitudes.jsx` (client).
  - `frontend-react/src/components/solicitudes/SolicitarArriendoForm.jsx`: receives `propiedadId` as a prop; the antecedentes fields; on success shows "Solicitud enviada".
  - `App.jsx`: `<Route path="solicitudes" element={<SolicitudesPanel />} />` inside the `EJECUTIVO` group and `<Route path="mis-solicitudes" element={<MisSolicitudes />} />` inside the `CLIENTE` group.
- **Screens:**
  - **Executive:** list (propiedad, cliente, fecha, estado) with the buttons the state allows (`PENDIENTE`: evaluar, cancelar; `EN_EVALUACION`: aprobar, rechazar; `APROBADA`: cancelar); a detail view with the antecedentes and the observaciones history.
  - **Client:** their requests with estado; "Cancelar" only while `PENDIENTE`.
- **Backend touch-ups in your own files (allowed, you own `solicitudesArriendo`):** `GET /solicitudes` and `/:id` do not populate; add `.populate("propiedadId", "titulo direccion valorArriendo")` and `.populate("clienteId", "nombre email")` so the screens show names instead of ids.
- **Dependency:** the "Solicitar arriendo" form lives in the public property detail page (`frontend-react/src/pages/DetallePropiedadPage.jsx`, Deyby). Until it is merged, test `SolicitarArriendoForm` from your `MisSolicitudes` page with a seed property `_id`. When it is merged, render your form in the `CLIENTE` branch of `AccionesCliente` (a comment marks the spot), replacing the "Muy pronto..." text. Use `formatearPrecio` / `formatearFechaHora` from `src/utils/formato.js`.
- **Acceptance checks:**
  - [ ] Ana (`cliente@gup.cl`) sees only her 2 requests; Carla sees only the ones assigned to her.
  - [ ] Ana sends a request for a `PUBLICADA` property → appears as `PENDIENTE` in both views.
  - [ ] Request for a non-`PUBLICADA` property → the backend's `409` message.
  - [ ] Carla: evaluar → aprobar → the property becomes `RESERVADA` (visible in the executive properties list / Compass); a second approval → `409`.
  - [ ] Ana can cancel a `PENDIENTE` request and has no cancel button on others.
- **Suggested commits:** `feat: add rental request service` · `feat: add client requests page` · `feat: add rental request form` · `feat: add executive requests panel` · `feat: add request state actions`.

### Deyby — Properties, catalog, session pages, audit log

- **Order (others depend on the first one):**
  1. Public property detail `/propiedades/:id` (`GET /catalogo/:id`) — Roberto and Ignacio plug their buttons here.
  2. Catalog `/propiedades` with real data and filters (`GET /catalogo`, `GET /tipo-propiedades` for the type select); landing featured properties.
  3. `RegisterPage` connected to `POST /auth/register`, then login automatically.
  4. Executive properties panel (`propiedades`): list, create/edit (owner select from Santiago's `listarPropietarios()`), state changes by the transition table, soft delete.
  5. Owner view (`mis-propiedades`) and audit log (`bitacora`, ADMIN, filters).
- **Files:** `services/propiedad.service.js`, `services/catalogo.service.js`, `services/bitacora.service.js`, and their pages and components.

---

## Decisions

- **CORS only, explicit origin** (`CORS_ORIGIN`, default `http://localhost:5173`, never `*`) — professor's instruction; no Vite proxy.
- **Token in `localStorage`, user from `/auth/me`** — survives reloads; the XSS risk is documented in `AGENTS.md` (no `dangerouslySetInnerHTML`).
- **`menuPanel.js` lists every section from the start** — teammates only add one `<Route>` line, so `App.jsx` conflicts are "keep both lines".
- **After login, go back to the page that asked for it, else `/panel`** — via `state.desde` set by `RutaProtegida`.

## Session log

| Date | What was done | Result / next step |
|---|---|---|
| 2026-11-17 | Phase 0 built on `feature/deyby/integracion-base`: CORS, `VITE_API_URL`, `apiFetch`, `AuthContext`, `RutaProtegida`, role-based panel, login and header connected; frontend conventions added to `AGENTS.md`; task cards for every teammate. Tested in the browser with every seed role. | Merge the base PR, notify the team, start Phase 1 (Deyby: property detail first). |
| 2026-11-17 | Base merged (PR #39). Phase 1, Deyby: public property detail `/propiedades/:id` with the action box where Roberto's and Ignacio's components go; shared `utils/formato.js`. | PR for the detail, then the catalog with real data. |
| 2026-11-17 | Detail (#40) and catalog + home + 25 property fixtures (#41) merged. Registration postponed as technical debt (seed accounts for the presentation). Executive properties panel (edit, state, delete) with the shared `Modal`: reference screen for every teammate's panel. | Teammates: copy `PropiedadesPanel.jsx`. Santiago: merge `propietario.service.js` early (needed for creating properties). |
| 2026-11-17 | Owner view + audit log merged (#43). Session made visible: header user menu with initials, name, role, "Mi panel" and "Mi perfil"; profile page `/panel/perfil` with the role's shortcuts; `ROLES` and `iniciales` added to `layouts/menuPanel.js`. | Teammates do not touch the header or the profile; their sections already appear as shortcuts. |
| 2026-11-20 | Merged clients (#46), owners (#48), rental requests (#47) and visits (#45). Conflicts in `App.jsx` resolved by keeping every route; the visits review fixes (colors, newlines, JSDoc, `listarClientes()` instead of `apiFetch("/clientes")`) were applied by the integrator. Final end-to-end pass on `development` with every role. | Presentation (`docs/DEMO.md`). Next: Ignacio's client visits, Deyby's create property, RUT normalization fix, registration. |
