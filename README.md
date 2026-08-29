# Real Estate Management

Course project for **Desarrollo Web y Móvil** (Web and Mobile Development) at **Universidad Andrés Bello (UNAB)**.

## Team

- Deyby Camacho
- Roberto Varillas
- Santiago Sanchez
- Ignacio Latrach

**Instructor:** Jerry Jesus Peña

## About

A real estate management system built incrementally over the course of the semester.

## Current status

The project is in its **design phase**. Right now we are only starting to implement the frontend design, based on mockups that were created with the support of AI tools.

- **Frontend** — in progress, using HTML, CSS and some JavaScript.
- **Backend** — not implemented yet. It stays on hold until it is unlocked later in the semester.

## Project structure

```
.
├── frontend/          # HTML, CSS and JS (design phase)
│   ├── landing_page.html
│   ├── css/
│   └── js/
├── backend/           # Reserved, not implemented yet
└── docs/              # Project documentation
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

The full project brief is available in [docs/Caso3_GestionInmobiliaria.docx](docs/Caso3_GestionInmobiliaria.docx).
