# client/economy/README.md

## Purpose
Handles cost calculations, budget tracking, and economic feedback for the player during arsenal selection and draft.

## What belongs here
- Logic for aggregating item costs and checking against the player’s budget.
- UI helpers for displaying remaining budget.
- Helper functions to query costs from `client/data`.

## What must NOT be placed here
- Direct manipulation of match state or server‑authoritative data.
- Reward calculation or unlock progression.

## Future expected files
- `budget_manager.gd` – tracks remaining cost budget.
- `cost_utils.gd` – utilities for summing item costs.
