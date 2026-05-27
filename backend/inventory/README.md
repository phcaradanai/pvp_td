# backend/inventory/README.md

## Purpose
Handles storage and retrieval of player-owned items, cosmetics, and inventory state on the server.

## What belongs here
- Database models for items owned by each player.
- Services to add/remove items, query inventory, and persist changes.
- Validation that items being added exist in the master data definitions.

## What must NOT be placed here
- Client‑side UI code or visual assets.
- Direct manipulation of match simulation state.

## Future expected files
- `inventory_service.gd`
- `item_repository.gd`
