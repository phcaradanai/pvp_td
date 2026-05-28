# backend/README.md

## Purpose
Contains all server‑side code that runs authoritatively. It handles player accounts, matchmaking, match simulation, reward calculation, unlock progression, and data persistence.

## What belongs here
- Modules listed under `backend/` (account, api, inventory, unlock, matchmaking, room, draft, match, reward, websocket, persistence, tests, contracts).
- Business logic that determines outcomes, validates actions, and stores state.

## What must NOT be placed here
- Client‑side UI code or rendering assets.
- Direct manipulation of client visual state.
- Non‑authoritative shortcuts that bypass server validation.

## Future expected files
- Service implementations for each domain (e.g., `match_service.py`).
- Database models and repository layers.
- Integration tests for end‑to‑end match flow.
