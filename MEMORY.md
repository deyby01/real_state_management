# MEMORY.md — Persistent project memory

> **What it is:** this file is the persistent memory of the project. It stores what the project is, what has been done, what is being done, what comes next and the necessary references.
> **Agent role and rules:** see [`AGENTS.md`](AGENTS.md). That file defines who the agent is, how it must act and which mistakes not to repeat.
> **Last updated:** 2026-10-31
> **Keep:** do not exceed ~1000 lines. Summarize, do not duplicate. Deep technical details live in `docs/DATA_MODEL.md` and in the case specification.

> ⚠️ **For the agent:** always read `AGENTS.md` and `MEMORY.md` together at the start of every session. `AGENTS.md` contains the role, rules and mistakes; `MEMORY.md` contains the project context.

---

## PROJECT NAME

**Real Estate Management — Gestión Urbana de Propiedades (GUP)**

Web platform for real estate management, rentals and property administration, developed as a project for the **Web and Mobile Development** course at **Universidad Andrés Bello (UNAB)**.

### What it is

GUP is a fictional company (based on the course case study) that manages, publishes and rents real estate. Its portfolio is around **350 properties** from different owners, including apartments, houses, offices and commercial spaces.

The client's current problem is that information lives scattered across spreadsheets, emails, document folders and instant messaging. There is no single source of truth for which property is available, who its owner is, which executive is assigned to it, which visits were scheduled, or which rental requests are pending. This causes errors such as publishing properties that are already reserved or rented, scheduling two visits at the same time with the same executive, or processing more than one rental approval for the same property.

The solution is a **centralized web platform** with role-based access that allows:

- Centralizing properties, owners, clients, visits and requests.
- Publishing a catalog of available properties with filters.
- Keeping traceability of interested clients, visits, evaluations and reservations.
- Providing up-to-date information on the status of each property.
- Generating management reports.

### System actors

| Actor | Main capabilities |
|---|---|
| **Administrator** | Manages users and general parameters; views reports. |
| **Real Estate Executive** | Manages owners, properties, publications, clients, visits and rental requests; evaluates and reserves; views reports. |
| **Owner** | Views **only** the status of their own properties under management. |
| **Client / Tenant** | Views available properties, requests visits and submits rental requests. Once a tenant, views their rental information. |

### Main business flow

```
Property search
   → Visit request (Client)
      → Visit management (Executive: confirm/modify/reject/cancel and record the result)
         → Rental request (Client)
            → Evaluation (Executive)
               → Property reservation (RESERVADA status)
                  → Contract signing (ARRENDADA status)
```

This flow must be demonstrable end to end: **React → Node/Express → MongoDB**.

### Mandatory technology stack

| Layer | Technology |
|---|---|
| Frontend | React, HTML, CSS (responsive) |
| Backend | Node.js + Express |
| Database | MongoDB (NoSQL) + Mongoose |

### Team and academic context

- **Course:** Web and Mobile Development — Universidad Andrés Bello (UNAB).
- **Instructor:** Jerry Jesus Peña.
- **Team:** Deyby Camacho, Roberto Varillas, Santiago Sanchez, Ignacio Latrach, Jose Hernandez.
- **Format:** project built incrementally week by week.
- **Language:** technical documentation is in English; domain names (collections, fields, models, states, API routes) are in Spanish, exactly as in `docs/DATA_MODEL.md`; UI, API messages and team communication are in Spanish. See [`AGENTS.md → Language conventions`](AGENTS.md#language-conventions). Business statuses are stored as uppercase constants (`DISPONIBLE`, `PUBLICADA`, etc.) to avoid accent and capitalization issues.

---

## PROJECT STATUS

### Current status (2026-10-31)

The project is in the **data model design and backend preparation phase**. The React frontend already has the pages mocked up, but it does not consume the API yet. The backend only has a health-check endpoint. The database is empty and has no models defined in code, although a documented model proposal already exists.

| Area | Status | Detail |
|---|---|---|
| UI design | ✅ Done | Landing, Properties, About Us, Contact and Login/Register pages mocked up in React + Tailwind. |
| Original HTML/CSS frontend | ⏸️ Frozen | `frontend/` remains only as a design reference. No new features are added. |
| React frontend | 🚧 In progress | Static pages; no API calls yet. |
| Express backend | 🚧 In progress | `GET /api/health` and the first MVC flow: `TipoPropiedad` model, controller and routes (`GET`/`POST /api/tipo-propiedades`, PR #19). The server stops if the DB connection fails (PR #17). |
| MongoDB data model | 🚧 1 of 8 implemented | `docs/DATA_MODEL.md` contains the full proposal; only `tiposPropiedad` exists in code. |
| Postman testing | ⏳ Pending | Will be done after implementing the models and endpoints. |
| Authentication | 🚧 Starting | Next topic: `Usuario` model, register/login with bcryptjs + JWT, auth and role middlewares. |

### What is being done now

1. **Learning Express by building the backend.** The `TipoPropiedad` MVC flow is done; the developer is now learning **JWT and middlewares** through the `usuarios` collection and the `/api/auth` endpoints.
2. **Validate and close the MongoDB data model** with the professor and the team.
3. **Plan the backend tests with Postman** for the next stage.
4. **AI mentor flow for the team:** `AGENTS.md` + `MEMORY.md` are also used with OpenCode, so teammates without Claude Code can work with an AI tutor following the same rules.

### Status history (chronological, brief)

| Date / stage | Status | Note |
|---|---|---|
| Start of semester | Landing and static pages design | HTML/CSS versions were built (`landing_page.html` to `landing_page_v4.html`, `about_us.html`, `contacto.html`, `properties.html`). |
| Migration week | Frontend migrated to React + Tailwind + Vite | The HTML/CSS frontend was frozen and kept as a reference. React pages and components were created. |
| Environment week | Docker Compose + Makefile | MongoDB, backend and frontend run together with `make up`. |
| Initial backend week | Express + Mongoose + health check | Only `GET /api/health` exists; MongoDB connection through `MONGO_URI`. |
| Current week (2026-10-31) | Data modeling | Proposal documented in `docs/DATA_MODEL.md`; pending validation and implementation. |

### Current repository structure

```
real_state_management/
├── frontend-react/          # Active frontend: React + Tailwind CSS + Vite
│   ├── src/
│   │   ├── assets/          # Images and resources
│   │   ├── components/      # Header, Footer, PropertyCard, landing/, properties/, Login/
│   │   ├── pages/           # LandingPage, PropertiesPage, AboutUs, ContactPage, LoginPage, RegisterPage
│   │   ├── App.jsx          # Routes with react-router-dom
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind + color theme and font
│   ├── Dockerfile
│   └── package.json
├── backend/                 # Express + Mongoose
│   ├── src/
│   │   ├── config/db.js     # MongoDB connection
│   │   ├── models/          # TipoPropiedad.js
│   │   ├── controllers/     # tipoPropiedad.controller.js
│   │   ├── routes/          # tipoPropiedad.routes.js
│   │   ├── middlewares/     # (empty, auth comes next)
│   │   ├── app.js           # Express app: middlewares and routers
│   │   └── index.js         # Entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                # Design reference (HTML/CSS/JS), frozen
├── docs/                    # Project documentation
│   ├── Caso3_GestionInmobiliaria.docx               # Original case document
│   ├── Caso3_GestionInmobiliaria_Especificaciones.md # Structured specification
│   ├── DATA_MODEL.md        # Proposed MongoDB data model (detailed)
│   ├── SETUP.md             # Installation and command guide
│   └── Landing-Home.pdf
├── docker-compose.yml       # MongoDB + backend + frontend
├── Makefile                 # Docker shortcuts
├── AGENTS.md                # Agent role, rules and lessons
├── MEMORY.md                # This file
└── README.md
```

### Frontend routes already created

| Route | Page |
|---|---|
| `/` | LandingPage |
| `/propiedades` | PropertiesPage |
| `/nosotros` | AboutUs |
| `/contacto` | ContactPage |
| `/login` | LoginPage |
| `/registro` | RegisterPage |

### Existing backend endpoints

| Method | Route | Response |
|---|---|---|
| `GET` | `/api/health` | `{"status":"ok"}` |
| `GET` | `/api/tipo-propiedades` | List of active property types |
| `POST` | `/api/tipo-propiedades` | Creates a type (`201`); duplicate name → `409` |

---

## NEXT STEPS

### Current step — Authentication with JWT (branch `feature/deyby/jwt-auth-setup`, Deyby)

The developer is learning JWT and middlewares while building it, following the [teaching loop](AGENTS.md#teaching-loop). Each step is tested in Postman before the next one.

| # | Step | What to test in Postman | Status |
|---|---|---|---|
| 0 | `JWT_SECRET` and `JWT_EXPIRES_IN` in `docker-compose.yml`, `backend/.env.example` and `backend/README.md` | — | ✅ Done |
| 1 | Install `jsonwebtoken` and `bcryptjs` (`make build` afterwards); stop the server at startup if `JWT_SECRET` is missing, like `db.js` does with `MONGO_URI` | Server starts; with `JWT_SECRET` removed from **both** `docker-compose.yml` and `backend/.env`, it stops with a clear message | ✅ Done: libraries installed (`bcryptjs` 3, `jsonwebtoken` 9); `index.js` stops with a clear message if `JWT_SECRET` is missing (tested) |
| 2 | `models/Usuario.js` following `docs/DATA_MODEL.md` (`passwordHash` with `select: false`) | — | ✅ Done (validations tested: `trim`, `lowercase`, `enum`) |
| 3 | `POST /api/auth/register`: always creates `CLIENTE`, hashes the password | Hash visible in Compass; duplicate email → `409`; sending `"rol":"ADMIN"` still creates `CLIENTE` | ✅ Done (5 Postman tests passed; password minimum 8 characters) |
| 4 | `POST /api/auth/login`: returns a JWT with `_id` and `rol` | Token returned; inspect it on jwt.io; wrong email or password → `401` with the same message | ⏳ |
| 5 | `middlewares/auth.middleware.js` + `GET /api/auth/me` | No token → `401`; valid token → user data without `passwordHash` | ⏳ |
| 6 | `middlewares/role.middleware.js`; protect `POST /api/tipo-propiedades` for `ADMIN` only | As `CLIENTE` → `403`; as `ADMIN` → `201` | ⏳ |

**Decisions taken (pending professor validation where noted):**

- Clients self-register from `/registro`; `ADMIN`, `EJECUTIVO` and `PROPIETARIO` accounts are created by an admin *(pending validation)*.
- The first `ADMIN` is created by the **fixtures**, since nobody can register as admin.
- Registration first creates only the `usuarios` document. Creating the linked `clientes` record (D1, `clienteId`) is added once register and login work.
- Password confirmation ("repeat your password") is validated **only in the frontend**: the register form already has the field. The API receives a single `password`, because it is also used by admins and fixtures, where confirmation makes no sense.
- Security rules for this step: [`AGENTS.md → Security and authentication`](AGENTS.md#security-and-authentication).

### Step 1 — Close the data model (this week)

**Goal:** present the MongoDB collection schema and business rules to the professor.

**What it involves:**

1. Review the proposal in `docs/DATA_MODEL.md` (8 collections: `usuarios`, `propietarios`, `clientes`, `tiposPropiedad`, `propiedades`, `visitas`, `solicitudesArriendo`, `bitacora`).
2. Validate the design decisions with the professor:
   - Separate the account (`usuarios`) from the business person (`propietarios` / `clientes`).
   - Embed address and images inside `propiedades`.
   - Embed background data and notes inside `solicitudesArriendo`.
   - Do not create a `reservas` collection: a reservation is a property in `RESERVADA` + an `APROBADA` request.
   - Store statuses as uppercase constants (`DISPONIBLE`, `PUBLICADA`, `RESERVADA`, `ARRENDADA`, `EN_MANTENCION`, `INACTIVA`).
3. Confirm the business rules and state machines (property, request, visit).
4. Confirm the indexes, especially the partial unique index that guarantees a single `APROBADA` request per property.
5. Resolve the open questions (see "Current blockers").
6. Draw the entity-relationship diagram (Mermaid is already in `docs/DATA_MODEL.md`) for the presentation.

**Deliverable:** validated data model document and diagram ready to present.

### Step 2 — Implement the Mongoose models (next week)

**Goal:** turn the documented model into code schemas.

**What it involves:**

1. Create one file per collection in `backend/src/models/`:
   - `Usuario.js`, `Propietario.js`, `Cliente.js`, `TipoPropiedad.js`, `Propiedad.js`, `Visita.js`, `SolicitudArriendo.js`, `Bitacora.js`.
2. Define in each schema: fields, types, `required`, `enum`, `default`, `timestamps` and explicit collection name.
3. Create the indexes defined in `docs/DATA_MODEL.md` (unique, compound and partial unique).
4. Implement soft delete (`activo: false`) instead of physical deletion.
5. Prepare the **fixtures** (test data): users per role, property types, owners, clients, properties in different states, visits and requests.
6. Verify in MongoDB Compass that the collections and indexes are created correctly.

**Deliverable:** working Mongoose models and a database populated with fixtures.

### Step 3 — Implement authentication and endpoints (next week)

**Goal:** have a minimal REST API to test with Postman.

**What it involves:**

1. Authentication:
   - Client registration.
   - Login with email and password.
   - Password hashing with `bcryptjs`.
   - JWT tokens with expiration.
   - Authentication and role middleware.
2. Suggested minimum endpoints:
   - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`.
   - `GET /api/catalogo` with filters (`comuna`, `tipo`, `precioMin`, `precioMax`, `dormitorios`, `banos`).
   - `GET/POST/PUT /api/propiedades`, `PATCH /api/propiedades/:id/estado`.
   - `GET/POST/PUT /api/propietarios`.
   - `GET/POST/PUT /api/clientes`.
   - `POST /api/visitas`, `PATCH /api/visitas/:id/{confirmar,rechazar,cancelar,resultado}`, `PUT /api/visitas/:id`.
   - `POST /api/solicitudes`, `PATCH /api/solicitudes/:id/{evaluar,aprobar,rechazar,cancelar}`.
   - `POST /api/propiedades/:id/reserva`, `DELETE /api/propiedades/:id/reserva`.
   - `GET /api/mis-propiedades` (owner).
   - `GET /api/reportes/{propiedades,visitas,solicitudes}`.
3. Implement the business rules in the service/controller layer:
   - Allowed state transitions (reject the rest with `409`).
   - Catalog only with `PUBLICADA` and `activo: true` properties.
   - Visits only on `PUBLICADA` properties.
   - Detection of overlapping visits per executive (`409`).
   - A single `APROBADA` request per property (`409`).
   - Approving a request reserves the property.
   - Record every state change in `bitacora`.
   - Owner data isolation (`403`/`404`).
   - Owner private data kept out of the public catalog.
4. Expected HTTP codes: `200`, `201`, `400`, `401`, `403`, `404`, `409`.

**Deliverable:** functional REST API with business rules and test data.

### Step 4 — Postman testing (next week)

**Goal:** demonstrate the end-to-end flow and the business rules.

**What it involves:**

1. Create a Postman collection saved in the repository.
2. Document each request: method, URL, headers (`Authorization: Bearer <token>`), JSON body and expected response.
3. Demonstrate the full flow:
   - Log in as executive → create property → publish it.
   - Log in as client → browse catalog → request a visit.
   - Executive → confirm visit → record result.
   - Client → submit rental request.
   - Executive → evaluate → approve → property becomes `RESERVADA`.
   - Executive → release reservation → property returns to `PUBLICADA` or `DISPONIBLE`.
4. Demonstrate the error cases:
   - Invalid state transition → `409`.
   - Overlapping visit → `409`.
   - Second approval for the same property → `409`.
   - Duplicate client (same RUT/email) → `409`.
   - Owner requesting another owner's property → `403`/`404`.
   - Protected endpoint without token → `401`.
5. Show the `bitacora` with the changes generated during the demo.

**Deliverable:** Postman collection + screenshots/evidence of the flow and rules.

### Step 5 — Connect the frontend to the API (after Postman)

**Goal:** make the React pages stop being mockups and consume real data.

**What it involves:**

1. Configure the API base URL (Vite environment variable).
2. Implement `fetch`/`axios` calls in:
   - Property catalog and filters.
   - Contact form (if it is decided to persist it).
   - Login and registration.
   - Visit and rental request forms.
3. Handle loading states, errors and user messages.
4. Implement protected routes based on role.
5. Replace hardcoded data with API data.

**Deliverable:** working full-stack integration.

### Step 6 — Reports and closure

**Goal:** cover RF12 and the final deliverables.

**What it involves:**

1. Reports of available and rented properties.
2. Reports of completed visits.
3. Reports of requests by status.
4. Reports of payments and pending requirements (if implemented).
5. Final documentation: API, data model, screenshots, test users per profile.

**Deliverable:** complete functional prototype and documentation.

### Current blockers

| Blocker | Impact | Action needed |
|---|---|---|
| Data model validation with the professor | The definitive schemas should not be written until it is confirmed. | Present `docs/DATA_MODEL.md` and resolve doubts. |
| Visit duration | Affects overlap calculation (RN-10). Proposal: fixed 1 hour. | Confirm with the professor. |
| Rental request background data | Defines the `antecedentes` object. Proposal: monthly income, occupation, number of occupants, pets. | Confirm with the professor. |
| Who creates the accounts | Defines the registration flow and permissions. Proposal: clients self-register; owners and executives are created by the admin. | Confirm with the professor. |
| Executive assignment to a property | Affects `propiedades.ejecutivoId`. Proposal: manual assignment when creating the property. | Confirm with the professor. |
| Scope of contracts, payments and requirements | RF12 mentions them, but the document does not define models. Proposal: out of scope at this stage. | Confirm with the professor. |
| Image limits | Affects file validation (RNF-11). Proposal: JPG/PNG/WebP, 2 MB, 10 per property; for now only URLs are stored. | Confirm with the professor. |
| What happens to other requests when one is approved | Proposal: they stay as they are; when the property is rented they move to `RECHAZADA`. | Confirm with the professor. |

### Recommended work order

1. Validate the data model (this week).
2. Implement Mongoose models + indexes + fixtures.
3. Implement authentication and role middleware.
4. Implement endpoints and business rules.
5. Test with Postman.
6. Connect the frontend.
7. Reports and final documentation.

---

## AGENT RULES AND MISTAKES

The agent's operating rules, mistakes and lessons are kept in [`AGENTS.md`](AGENTS.md), so this file stays focused only on the project.

- **Agent role and principles:** see [`AGENTS.md → Agent role`](AGENTS.md#agent-role).
- **Rules:** see [`AGENTS.md → Rules`](AGENTS.md#rules).
- **Mistakes and lessons:** see [`AGENTS.md → Mistakes and lessons`](AGENTS.md#mistakes-and-lessons).

---

## DOCS AND REFERENCES

### Documentation available in `docs/`

| File | What it contains | When to consult it |
|---|---|---|
| `docs/Caso3_GestionInmobiliaria.docx` | Original case document provided by the professor. | Source of truth for the business. |
| `docs/Caso3_GestionInmobiliaria_Especificaciones.md` | Structured case specification: actors, RF, RNF, rules, states, suggested data model, API, deliverables and acceptance criteria. | Main reference for requirements. |
| `docs/DATA_MODEL.md` | Detailed MongoDB model proposal: 8 collections, design decisions, Mermaid diagrams, state machines, rules, indexes, fixtures and Postman plan. | Main reference for implementing the backend. |
| `docs/SETUP.md` | Installation and execution guide on Windows, macOS and Linux: Docker, Git, make, MongoDB Compass, commands and troubleshooting. | To set up the environment. |
| `docs/Landing-Home.pdf` | Visual reference for the landing page. | Design. |

### Root documentation

| File | What it contains |
|---|---|
| `README.md` | General description, team, status, structure, how to run with Docker, Git workflow and links to the documentation. |
| `backend/README.md` | Backend status, structure, environment variables and running without Docker. |
| `frontend/README.md` | Description of the frozen HTML/CSS frontend. |
| `frontend-react/README.md` | Generic Vite README (pending customization). |

### Summary of the case specification

#### Functional requirements (RF)

| ID | Requirement | Priority |
|---|---|---|
| RF1 | User registration, authentication and administration by profile (Administrator, Executive, Owner, Client/Tenant). | High |
| RF2 | Register and manage owners, associating them with one or more properties. | High |
| RF3 | Register and manage properties: type, owner, location, area, features, rent value, common expenses, photographs and status. | High |
| RF4 | Control property statuses by applying allowed transitions. | High |
| RF5 | Publish available properties and browse the catalog with filters (comuna, type, price range, bedrooms, bathrooms). | High |
| RF6 | Register interested clients avoiding duplicates by identifier and contact data. | High |
| RF7 | The client requests visits indicating date, time and observations; the Executive confirms, modifies, rejects or cancels. | High |
| RF8 | Manage visits avoiding overlaps in the Executive's schedule and recording the result. | High |
| RF9 | The client generates a formal rental request with the background data defined for evaluation. | High |
| RF10 | The Executive evaluates requests, records observations and changes their status while maintaining traceability. | High |
| RF11 | Reserve a property when there is an approved request, avoiding incompatible multiple approvals and allowing the reservation to be released. | High |
| RF12 | Generate queries on available and rented properties, completed visits, requests, payments and pending requirements. | Medium |

#### Key non-functional requirements (RNF)

| ID | Requirement |
|---|---|
| RNF-01 | Responsive application (computer, tablet, mobile). |
| RNF-02 | Separate interface, business logic and persistence. |
| RNF-03 | Mandatory stack: React + HTML/CSS, Node.js + Express, MongoDB. |
| RNF-04 | Secure authentication and role-based access control. |
| RNF-05 | Passwords with secure hashing; sessions/tokens managed securely. |
| RNF-06 | Validations on frontend and backend, with clear messages. |
| RNF-07 | An owner can only view properties associated with their account. |
| RNF-08 | Owners' private information is not shown publicly. |
| RNF-09 | State rules, visit overlaps, request evaluation and reservations are validated in the backend. |
| RNF-10 | Soft delete, not physical deletion, when there is history. |
| RNF-11 | Restrictions on image format, size and quantity. |
| RNF-12 | Audit log of relevant operations (who, when, previous state → new state). |
| RNF-13 | Catalog and filter queries with adequate response times. |
| RNF-14 | Clear messages about request results, status changes and availability. |

#### Explicit business rules (RN)

| ID | Rule |
|---|---|
| RN-A | An available property can be published so clients can browse it and request a visit. |
| RN-B | When a request is approved, the property may temporarily move to Reserved. |
| RN-C | Once the contract is signed, the property moves to Rented. |
| RN-D | Each property is associated with an owner; an owner can have several properties. |
| RN-E | It must be possible to add additional property types later. |
| RN-F | A client who becomes a tenant can view their rental information. |

#### Derived rules (proposed, to be validated)

| ID | Rule |
|---|---|
| RN-01 | Only `DISPONIBLE` properties can move to `PUBLICADA`. |
| RN-02 | A `RESERVADA` or `ARRENDADA` property does not appear in the public catalog as available. |
| RN-03 | Status changes only through allowed transitions; the backend rejects the rest (`409`). |
| RN-04 | Approving a request moves the property to `RESERVADA`; releasing the reservation returns it to `DISPONIBLE` or `PUBLICADA`. |
| RN-10 | An Executive cannot have two visits with overlapping times (excluding cancelled/rejected visits). |
| RN-11 | A client cannot be registered twice (same RUT or same email/phone). |
| RN-12 | Every rental request references an existing client and property. |
| RN-13 | Every state change generates a record in `bitacora`. |
| RN-14 | Only one active `APROBADA` request may exist per property; the check must be atomic. |
| RN-15 | Each property has an assigned responsible Executive. |
| RN-16 | Visits are requested only on `PUBLICADA` properties. |
| RN-17 | Deletion = soft delete, not physical deletion, when there is history. |

### Summary of the data model (`docs/DATA_MODEL.md`)

#### Collections (8)

| Collection | What it stores | Requirement |
|---|---|---|
| `usuarios` | Login accounts and roles. | RF1, RF2 |
| `propietarios` | Business data of owners. | RF3 |
| `clientes` | Interested clients and tenants. | RF6 |
| `tiposPropiedad` | Catalog of property types. | RN-E |
| `propiedades` | Properties, with embedded address and images. | RF4, RF5 |
| `visitas` | Visit requests and their result. | RF7, RF8 |
| `solicitudesArriendo` | Rental requests with embedded background data and notes. | RF9, RF10, RF11 |
| `bitacora` | Audit log of every state change. | RNF-12 |

#### Key design decisions

| ID | Decision | Why |
|---|---|---|
| D1 | Separate the account (`usuarios`) from the business person (`propietarios` / `clientes`). | The executive can register interested clients who do not have an account yet. |
| D2 | Administrators and executives are users with a role, without their own collection. | They have no additional business data. |
| D3 | Address and images are embedded in `propiedades`. | They only exist for that property and are always read with it. |
| D4 | `tiposPropiedad` is its own collection. | It allows adding new types without changing the code (RN-E). |
| D5 | Prices are numbers, not text. | They allow comparison and range filtering. |
| D6 | Nothing is physically deleted (`activo: false`). | Preserves traceability and referential integrity (RNF-10 / RN-17). |
| D7 | A reservation is not a collection. | It is a `RESERVADA` property + an `APROBADA` request; avoids duplicated and out-of-sync data. |
| D8 | Visits last a fixed 1 hour (`fechaInicio` + `fechaFin`). | Allows detecting overlaps (RN-10). |
| D9 | Statuses are stored as uppercase constants. | Avoids accent, space and capitalization issues. |
| D10 | `ejecutivoId` is copied onto visits and requests. | Allows searching by executive without querying the property and preserves history if the property is reassigned. |
| D11 | Collection names are defined explicitly in Mongoose. | Avoids incorrect automatic pluralization (`propiedads`). |
| D12 | `timestamps` adds `createdAt` and `updatedAt` automatically. | Fewer fields to maintain by hand. |

#### Main fields per collection

**`usuarios`:** `nombre`, `email` (unique, lowercase), `passwordHash`, `rol` (`ADMIN` | `EJECUTIVO` | `PROPIETARIO` | `CLIENTE`), `propietarioId` (only if role `PROPIETARIO`), `clienteId` (only if role `CLIENTE`), `activo`.

**`propietarios`:** `rut` (unique, normalized without dots), `nombre`, `email`, `telefono`, `activo`.

**`clientes`:** `rut` (unique), `nombre`, `email` (unique), `telefono`, `ciudad`, `comuna`, `estado` (`INTERESADO` | `ARRENDATARIO`), `activo`.

**`tiposPropiedad`:** `nombre` (unique), `activo`.

**`propiedades`:** `titulo`, `tipoId`, `propietarioId`, `ejecutivoId`, embedded `direccion` (`calle`, `numero`, `comuna`, `ciudad`), `superficie`, `dormitorios`, `banos`, `estacionamientos`, `valorArriendo` (CLP integer), `gastosComunes` (CLP integer), `caracteristicas` (array of strings), embedded `imagenes` (`url`, `orden`), `estado`, `destacada`, `activo`.

**`visitas`:** `propiedadId`, `clienteId`, `ejecutivoId` (copied from the property), `fechaInicio`, `fechaFin` (start + 1 hour), `observaciones`, `estado`, `resultado`.

**`solicitudesArriendo`:** `propiedadId`, `clienteId`, `ejecutivoId` (copied from the property), embedded `antecedentes` (`ingresosMensuales`, `ocupacion`, `numeroOcupantes`, `tieneMascotas`), `estado`, embedded `observaciones` (`texto`, `usuarioId`, `fecha`).

**`bitacora`:** `entidad` (`PROPIEDAD` | `VISITA` | `SOLICITUD`), `entidadId`, `accion`, `estadoAnterior`, `estadoNuevo`, `usuarioId`, `observacion`, `fecha`.

#### State machines

**Property:**

```
DISPONIBLE → PUBLICADA | EN_MANTENCION | INACTIVA
PUBLICADA  → DISPONIBLE (unpublish) | RESERVADA (request approved) | EN_MANTENCION | INACTIVA
RESERVADA  → DISPONIBLE (release) | PUBLICADA (release and republish) | ARRENDADA (contract signed)
ARRENDADA  → DISPONIBLE (contract ends) | EN_MANTENCION | INACTIVA
EN_MANTENCION → DISPONIBLE | INACTIVA
INACTIVA   → DISPONIBLE (reactivate)
```

Rules: only `DISPONIBLE` can move to `PUBLICADA`; `RESERVADA` is only reached by approving a request, never by editing the property directly. The public catalog shows only `PUBLICADA` with `activo: true`.

**Rental request:**

```
PENDIENTE → EN_EVALUACION | CANCELADA
EN_EVALUACION → APROBADA (property → RESERVADA) | RECHAZADA
APROBADA → CANCELADA (releases reservation; property → DISPONIBLE or PUBLICADA)
RECHAZADA → (final)
CANCELADA → (final)
```

**Visit:**

```
SOLICITADA → CONFIRMADA | RECHAZADA | CANCELADA
CONFIRMADA → REALIZADA | CANCELADA
REALIZADA → (final)
RECHAZADA → (final)
CANCELADA → (final)
```

"Modifying" a visit is not a state: it means changing `fechaInicio`/`fechaFin` while it is `SOLICITADA` or `CONFIRMADA`, going through the overlap validation again.

#### Indexes

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `usuarios` | `{ email: 1 }` | Unique | Login and no duplicate accounts. |
| `propietarios` | `{ rut: 1 }` | Unique | No duplicate owners. |
| `clientes` | `{ rut: 1 }`, `{ email: 1 }` | Unique | RN-11. |
| `tiposPropiedad` | `{ nombre: 1 }` | Unique | No duplicate types. |
| `propiedades` | `{ estado: 1, "direccion.comuna": 1, tipoId: 1, valorArriendo: 1 }` | Compound | Catalog filters (RNF-13). |
| `propiedades` | `{ propietarioId: 1 }` | Normal | Owner's "my properties". |
| `visitas` | `{ ejecutivoId: 1, fechaInicio: 1, fechaFin: 1 }` | Compound | Schedule and overlap detection. |
| `solicitudesArriendo` | `{ propiedadId: 1 }` where `estado = "APROBADA"` | Partial unique | A single active approval per property (RN-14). |
| `bitacora` | `{ entidad: 1, entidadId: 1, fecha: -1 }` | Compound | History of one document, newest first. |

#### Where the model lives in the backend

```
backend/src/
├── models/        # One file per collection
├── controllers/   # Logic of each endpoint and business rules
├── routes/        # URLs of each endpoint
├── middlewares/   # JWT authentication and role checks
└── fixtures/      # Test data
```

#### Fixtures (test data)

They should include at least:

| Data | Amount | Purpose |
|---|---|---|
| Users | 1 per role (admin, 2 executives, owner, client) | Test login and permissions; two executives for reassignment and overlap. |
| Property types | 4 | Apartment, House, Office, Commercial space. |
| Owners | 2–3 | Demonstrate data isolation. |
| Clients | 3 | One with an account and others registered by phone. |
| Properties | ~10 | At least one in each state, in several comunas and price ranges. |
| Visits | 2–3 | One `CONFIRMADA` to test overlap. |
| Requests | 2 | One `PENDIENTE` ready to approve in the demo. |

Test passwords go in the fixtures README, never real passwords.

### Environment commands (Docker)

| make | docker compose | What it does |
|---|---|---|
| `make up` | `docker compose up -d` | Starts the whole stack in the background. |
| `make build` | `docker compose up -d --build --renew-anon-volumes` | Rebuilds images (use after changing dependencies). |
| `make down` | `docker compose down` | Stops and removes containers; keeps data. |
| `make restart` | `docker compose restart` | Restarts the services. |
| `make ps` | `docker compose ps` | Shows status and ports. |
| `make logs` | `docker compose logs -f --tail=100` | Live logs of all services. |
| `make logs-front` | `docker compose logs -f --tail=100 frontend` | Frontend logs. |
| `make logs-back` | `docker compose logs -f --tail=100 backend` | Backend logs. |
| `make logs-db` | `docker compose logs -f --tail=100 mongo` | MongoDB logs. |
| `make db-shell` | `docker compose exec mongo mongosh real_estate` | MongoDB shell. |
| `make clean` | `docker compose down -v` | Deletes containers and **all data** (asks for confirmation). |

**Services and ports:**

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000/api/health |
| MongoDB (Compass) | `mongodb://localhost:27017` |
| Database | `real_estate` |

### Backend environment variables

| Variable | Without Docker | With Docker |
|---|---|---|
| `PORT` | `4000` | `4000` |
| `MONGO_URI` | `mongodb://localhost:27017/real_estate` | `mongodb://mongo:27017/real_estate` |
| `JWT_SECRET` | Development key in `.env.example` | Development key in `docker-compose.yml` (local development only) |
| `JWT_EXPIRES_IN` | `1d` | `1d` |

### Team conventions

- **Git:** branch-based work with Pull Requests against `development`. Never commit directly to `development`.
- **Branch name:** `feature/user-name/implementation-name` (e.g., `feature/deyby/landing-page-header`).
- **Before working:** `git checkout development && git pull origin development`.
- **Before the PR:** `git fetch origin && git rebase origin/development`.
- **Language:** technical docs in English; domain names, UI and API messages in Spanish (see `AGENTS.md`).
- **Statuses:** uppercase constants, without accents or spaces.
- **Prices:** integer numbers in CLP.
- **Deletion:** soft delete (`activo: false`).

### Key acceptance criteria (for the final demo)

| # | Criterion |
|---|---|
| CA-01 | An authenticated owner only sees their own properties; requesting someone else's returns `403`/`404`. |
| CA-02 | The public catalog never exposes the owner's contact data. |
| CA-03 | Creating or confirming a visit that overlaps another visit of the same executive returns `409`. |
| CA-04 | A disallowed state transition returns `409` with a clear message. |
| CA-05 | Approving a second request for an already reserved property is rejected. |
| CA-06 | Cancelling or releasing a reservation returns the property to a marketable state. |
| CA-07 | Registering a client with an existing identifier is rejected. |
| CA-08 | Deleting an entity with history performs a soft delete, not a physical deletion. |
| CA-09 | Every state change is recorded in `bitacora` with user and date. |
| CA-10 | The full flow search → visit → request → evaluation → reservation works from the UI. |
| CA-11 | Passwords stored with a hash (bcrypt/argon2); tokens with expiration. |
| CA-12 | Images that exceed the allowed format/size/quantity are rejected. |

### Minimum case deliverables

1. Repository with a clearly organized `frontend/`, `backend/` and `database/` structure.
2. Functional prototype: navigation, authentication, forms, tables/listings, catalog with filters, image upload or display and responsive design.
3. Implementation of the 4 profiles: Administrator, Real Estate Executive, Owner and Client/Tenant.
4. Documented REST API or backend services.
5. MongoDB data model (minimum: users, owners, clients, properties, images/references, visits and rental requests).
6. Seed data with different owners, types, statuses, clients, visits and requests.
7. Implementation and evidence of business rules: statuses, prevention of overlapping visits, request evaluation and reservation.
8. Evidence of full-stack integration with end-to-end flows (React → Express → MongoDB).
9. Functional evidence of the main flow.
10. Test users for each profile and screenshots of the main features.

### Quick links

- Structured specification: [`docs/Caso3_GestionInmobiliaria_Especificaciones.md`](docs/Caso3_GestionInmobiliaria_Especificaciones.md)
- Data model: [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)
- Setup guide: [`docs/SETUP.md`](docs/SETUP.md)
- Main README: [`README.md`](README.md)
- Backend: [`backend/README.md`](backend/README.md)
- React frontend: [`frontend-react/README.md`](frontend-react/README.md)

---

## SESSION LOG

> Brief history of what was worked on in each session with the agent. Add one line per session.

| Date | What was done | Result |
|---|---|---|
| 2026-10-22 | Initial project analysis: documentation, backend, React frontend and HTML reference frontend. | Understanding of the status and open questions. |
| 2026-10-27 | Read the case specification in Markdown and analyzed the business model. | Summary of actors, RF, RNF and rules. |
| 2026-10-31 | Reviewed `docs/DATA_MODEL.md`, created the persistent memory and separated responsibilities between `AGENTS.md` and `MEMORY.md`. | `MEMORY.md` focused on the project; `AGENTS.md` with the agent's role, rules and mistakes. |
| 2026-10-31 | Translated `AGENTS.md` and `MEMORY.md` to English and added the language convention to `AGENTS.md`. | Documentation follows the English standard; explanations to the developer remain in Spanish. |
| 2026-10-31 | Reviewed the `TipoPropiedad` MVC flow (PR #19) and planned authentication: decisions on public registration, admin creation, `JWT_SECRET` handling and the order of steps. | Ready to start the `Usuario` model and auth endpoints. |
| 2026-10-31 | Created branch `feature/deyby/jwt-auth-setup`; added `JWT_SECRET`/`JWT_EXPIRES_IN` to Docker and docs; improved `AGENTS.md` for OpenCode (teaching loop, team and Git rules, technical conventions, auth security rules, Spanish domain names). | Teammates' agents follow the same conventions; auth step 1 is next. |

---

*End of the file. Keep it updated and below ~1000 lines. The agent's role, rules and mistakes live in [`AGENTS.md`](AGENTS.md).*
