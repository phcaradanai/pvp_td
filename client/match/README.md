# client/match/README.md

## Purpose
Handles the client‑side representation of a running match (read‑only view). It tracks unit positions, health bars, and visual effects for the player.

## What belongs here
- Data structures that mirror the authoritative match state coming from the server.
- Logic for interpolating positions, playing VFX, and updating UI.
- Event listeners for match‑phase transitions.

## What must NOT be placed here
- Any code that decides the winner, calculates damage, or awards rewards.
- Direct manipulation of game state without server confirmation.
- Networking code that bypasses the `client/net` layer.

## Future expected files
- `match_state.gd` – client‑side snapshot of the match.
- `visuals_manager.gd` – spawns and recycles visual effects.
- `ui_sync.gd` – updates health bars, scoreboards.
