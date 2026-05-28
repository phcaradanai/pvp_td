# backend/match/README.md

## Purpose
Runs the authoritative match simulation, determines outcomes, and produces final match results.

## What belongs here
- Core simulation engine that processes tower, creep, and spell interactions.
- Logic for health, damage, wave progression, and win condition evaluation.
- Result calculation and statistics generation (e.g., MVP, score).
- Must adhere to the `match_result_contract.mjs` for authoritative validation of submitted results.

## What must NOT be placed here
- Client‑side visual effects or UI code.
- Draft or room management logic (handled in `backend/draft` and `backend/room`).
- Direct networking code (handled in `backend/websocket`).

## Future expected files
- `match_service.gd`
- `simulation_engine.gd`
- `result_calculator.gd`
