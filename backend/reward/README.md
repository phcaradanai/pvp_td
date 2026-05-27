# backend/reward/README.md

## Purpose
Calculates server‑side rewards after a match, normalizes them, and integrates with the unlock system.

## What belongs here
- Reward calculation algorithms (e.g., MVP, win/loss bonuses, performance tokens).
- Normalization logic to keep rewards fair across skill tiers.
- Integration hooks to grant items via `backend/inventory` and unlocks via `backend/unlock`.

## What must NOT be placed here
- UI rendering or client‑side presentation of rewards.
- Direct match simulation logic (handled by `backend/match`).

## Future expected files
- `reward_service.gd`
- `reward_schema.json`
- `normalizer.gd`
