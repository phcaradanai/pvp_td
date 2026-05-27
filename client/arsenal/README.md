# client/arsenal/README.md

## Purpose
Manages the player‑side UI and validation for building an arsenal of towers, creeps, spells, relics, and guardians within the cost budget.

## What belongs here
- UI widgets for selecting items, displaying costs, and showing budget remaining.
- Validation logic that ensures the total cost does not exceed the budget.
- Interaction with `client/data` to list available options.

## What must NOT be placed here
- Direct modification of match state or server‑authoritative data.
- Gameplay calculations such as damage or cooldown handling.
- Networking code; all selections are sent via `client/net`.

## Future expected files
- `arsenal_builder.gd` – UI controller for the arsenal screen.
- `cost_calculator.gd` – computes total cost based on selected items.
- `validation_service.gd` – enforces cost limits and duplicate checks.
