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
- **Backend** — not implemented yet. It stays on hold until it is unlocked later in the semester.

## Project structure

```
.
├── frontend-react/    # Active frontend: React + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   ├── index.html
│   └── package.json
├── frontend/          # Design reference only (HTML, CSS and JS mockups)
│   ├── landing_page.html
│   ├── css/
│   └── js/
├── backend/           # Reserved, not implemented yet
└── docs/              # Project documentation
```

## Running the React frontend

Requirements: [Node.js](https://nodejs.org/) (LTS version recommended).

```bash
cd frontend-react
npm install
npm run dev
```

Then open the URL shown in the terminal (by default `http://localhost:5173`).

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

The full project brief is available in [docs/Caso3_GestionInmobiliaria.docx](docs/Caso3_GestionInmobiliaria.docx).
