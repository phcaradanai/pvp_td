# backend/room/README.md

## Purpose
Manages the lifecycle of a match room: creation, player join/leave, ready state, and cleanup.

## What belongs here
- Services to create a room, add/remove players, track ready status.
- Validation that only authorized players can join a room.
- Hooks for starting the draft when all players are ready.

## What must NOT be placed here
- Match simulation logic (belongs in `backend/match`).
- UI rendering or client‑side code.

## Future expected files
- `room_service.gd`
- `room_state.gd`
- `room_manager.gd`
