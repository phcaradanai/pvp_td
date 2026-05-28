# backend/README.md

## Purpose
Contains all server‑side code that runs authoritatively. It handles player accounts, matchmaking, match simulation, reward calculation, unlock progression, and data persistence.

## What belongs here
- Modules listed under `backend/` (account, api, auth, inventory, unlock, matchmaking, room, draft, match, reward, websocket, persistence, tests, contracts).
- Business logic that determines outcomes, validates actions, and stores state.
- `backend/persistence`: pure repository contracts and in-memory test doubles for future database adapters. It does not connect to a real database yet.
- `backend/idempotency`: pure idempotency contracts and in-memory test doubles for preventing duplicate result/reward persistence in future API flows.
- `backend/session`: pure session store contracts and an in-memory test double for future auth/session runtime integration.
- `backend/match_store`: pure match store contracts and an in-memory test double for future match context injection into protected API handlers.

## What must NOT be placed here
- Client‑side UI code or rendering assets.
- Direct manipulation of client visual state.
- Non‑authoritative shortcuts that bypass server validation.

## Future expected files
- Service implementations for each domain (e.g., `match_service.py`).
- Database models and repository layers.
- Integration tests for end‑to‑end match flow.
