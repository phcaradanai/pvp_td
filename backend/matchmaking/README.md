# backend/matchmaking/README.md

## Purpose
Handles matchmaking logic for creating and joining game rooms, including casual and ranked queues.

## What belongs here
- Queue management (e.g., ELO rating, skill brackets).
- Lobby creation, player pairing, and room allocation.
- Matchmaking configuration files.

## What must NOT be placed here
- Direct game simulation or match result logic (handled by `backend/match`).
- UI code or client‑side networking.

## Future expected files
- `matchmaking_service.gd`
- `queue_manager.gd`
- `rating_system.gd`
