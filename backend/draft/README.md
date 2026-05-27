# backend/draft/README.md

## Purpose
Implements authoritative draft validation and state management on the server.

## What belongs here
- Services to merge player arsenals into a shared pool.
- Turn‑based pick validation, cost checks, and draft termination logic.
- State objects representing the current draft round and remaining items.

## What must NOT be placed here
- Client‑side UI or visual presentation of the draft.
- Direct manipulation of match simulation outcomes.

## Future expected files
- `draft_service.gd`
- `draft_state.gd`
- `draft_validator.gd`
