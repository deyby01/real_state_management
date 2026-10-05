# Real Estate Management

Course project for **Desarrollo Web y Móvil** (Web and Mobile Development) at **Universidad Andrés Bello (UNAB)**.

## Team

- Deyby Camacho
- Roberto Varillas
- Santiago Sanchez
- Ignacio Latrach
- Jose Hernandez

**Instructor:** Jerry Jesus Peña

## About

A real estate management system built incrementally over the course of the semester.

## Current status

The design phase is done, and we are now moving the frontend to **React** with **Tailwind CSS**.

- **Frontend (React)** — in progress. From now on, all frontend work happens in the `frontend-react/` folder, using React, Tailwind CSS and Vite.
- **Frontend (HTML/CSS)** — frozen. The original `frontend/` folder, built with HTML, CSS and some JavaScript, **stays in the repo as a design reference** (landing page versions, About Us, Properties). We won't add new features there. We use it as a guide while we rebuild the pages in React.
- **Backend** — basic setup. An Express server connected to **MongoDB** through Mongoose. It only has a health check endpoint for now. See [backend/README.md](backend/README.md).
- **Development environment** — the whole stack (MongoDB, backend and frontend) runs with **Docker Compose**, so nobody needs to install MongoDB or match Node versions.

## Project structure

```
.
├── frontend-react/        # Active frontend: React + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/    # Shared components (Header, Footer, PropertyCard)
│   │   │   └── landing/   # Landing page sections
│   │   ├── pages/
│   │   └── assets/
│   ├── Dockerfile
│   └── package.json
├── backend/               # Express + Mongoose API
│   ├── src/
│   │   ├── config/db.js   # MongoDB connection
│   │   ├── app.js         # Express app and routes
│   │   └── index.js       # Entry point
│   ├── .env.example       # Template for your local .env
│   ├── Dockerfile
│   └── package.json
├── frontend/              # Design reference only (HTML, CSS and JS mockups)
├── docs/                  # Project documentation
│   └── SETUP.md           # Step-by-step setup guide (Windows, macOS, Linux)
├── docker-compose.yml     # Runs MongoDB + backend + frontend together
└── Makefile               # Shortcuts for the Docker commands
```

## Running the project with Docker (recommended)

The whole stack (MongoDB, backend and frontend) runs in Docker containers. You do **not** need Node.js or MongoDB Server installed.

> 📘 **First time? Follow the [development setup guide](docs/SETUP.md).** It has step-by-step instructions to install Docker Desktop, Git, make and MongoDB Compass on **Windows**, macOS and Linux, how to connect Compass, the full list of commands and a troubleshooting section.

### Quick start

With Docker Desktop open:

```bash
make up
```

`make up` starts everything **in the background** (`docker compose up -d`), so your terminal stays free. The first time takes a few minutes. After that it starts in seconds.

| Service | Open | What you should see |
|---|---|---|
| Frontend | http://localhost:5173 | The landing page |
| Backend | http://localhost:4000/api/health | `{"status":"ok"}` |
| MongoDB | MongoDB Compass at `mongodb://localhost:27017` | The project's database (`real_estate`) |

Edit the code as usual: **Vite reloads the browser and nodemon restarts the backend** on every save, on Windows, macOS and Linux.

### Most used commands

| make | docker compose | What it does |
|---|---|---|
| `make up` | `docker compose up -d` | Starts everything in the background |
| `make down` | `docker compose down` | Stops everything. **Database data is kept** |
| `make build` | `docker compose up -d --build` | Rebuilds and starts. Use it after a `package.json` changes |
| `make logs-front` / `make logs-back` / `make logs-db` | `docker compose logs -f --tail=100 <service>` | Live logs of one service (`Ctrl + C` to leave) |

Run `make` with no arguments to see all the commands. On **Windows**, run the `make` commands in **Git Bash**, or use the `docker compose` column in PowerShell. The [setup guide](docs/SETUP.md#commands) has the complete table.

### MongoDB Compass

The project's database runs inside Docker, but Compass connects to it as if it were installed on your computer: open Compass, create a new connection with the URI `mongodb://localhost:27017` and click **Connect**. No username or password needed.

If you installed **MongoDB Server** for class, stop it before running the project, because it uses the same port. See the [setup guide](docs/SETUP.md#8-if-you-installed-mongodb-server-for-class-stop-it) for the commands.

## Running without Docker

Requirements: [Node.js](https://nodejs.org/) (LTS version recommended), and MongoDB running locally for the backend.

```bash
# Frontend
cd frontend-react
npm install
npm run dev        # http://localhost:5173

# Backend (in another terminal)
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

## Git workflow

We work with a branch-based workflow on GitHub. **All changes go through a Pull Request — never commit directly to `development`.**

1. **Pull first.** Before starting any work, update your local copy of `development`:
   ```bash
   git checkout development
   git pull origin development
   ```
2. **Create a branch** using the following naming convention:
   ```
   feature/name-user/name-of-implementation
   ```
   For example: `feature/deyby/landing-page-header`.
3. **Work and commit** on your branch only.
4. **Rebase before opening the PR.** If `development` moved ahead while you were working, bring those changes into your branch to avoid conflicts:
   ```bash
   git fetch origin
   git rebase origin/development
   ```
   Fix any conflicts, then push (use `--force-with-lease` if you already pushed the branch before rebasing).
5. **Open the Pull Request** against `development` and wait for review before merging.

## Documentation

- **Project brief:** [docs/Caso3_GestionInmobiliaria.docx](docs/Caso3_GestionInmobiliaria.docx).
- **Development setup guide:** [docs/SETUP.md](docs/SETUP.md). How to install Docker, Git, make and MongoDB Compass, and run the project on Windows, macOS and Linux.
