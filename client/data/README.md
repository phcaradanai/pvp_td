# client/data/README.md

## Purpose
Client‑side data loading module. Handles reading JSON/YAML files from the `data/` folder and exposing them to other client subsystems.

## What belongs here
- Data loader scripts.
- Caching mechanisms for static game data (towers, creeps, spells, etc.).

## What must NOT be placed here
- Server‑side data validation or persistence logic.
- Gameplay calculations; those belong in specific modules.

## Future expected files
- `data_loader.gd` – loads and parses JSON files.
- `schema_validator.gd` – optional client‑side schema checks.
