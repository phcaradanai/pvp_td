# scripts/README.md

## Purpose
Contains one‑off helper scripts for repository maintenance, bootstrapping, and CI tasks.

## What belongs here
- Build scripts (e.g., `build.ps1`).
- Project setup scripts (e.g., `init_repo.ps1`).
- CI helper scripts for linting, testing, and data validation.

## What must NOT be placed here
- Game source code or gameplay logic.
- Large binary assets.

## Future expected files
- `build.ps1` – builds the project (placeholder).
- `init_repo.ps1` – clones sub‑modules, installs dependencies.
- `run_validation.ps1` – invokes tools/validation scripts.
