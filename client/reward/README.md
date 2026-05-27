# client/reward/README.md

## Purpose
Client‑side preview of post‑match rewards (visuals, UI feedback). Does **not** calculate or award rewards.

## What belongs here
- UI elements that display expected reward items after a match.
- Animations for reward reveal.
- Hooks to receive reward data from the server via `client/net`.

## What must NOT be placed here
- Actual reward calculation logic (handled server‑side in `backend/reward`).
- Direct modification of player inventory.

## Future expected files
- `reward_display.gd` – UI controller for reward screen.
- `reward_animation.gd` – handles visual effects.
