# backend/persistence/README.md

## Purpose
Provides database access, persistence services, and backup utilities for player data, match records, and unlock progress.

## What belongs here
- Repository classes for accounts, inventory, unlocks, matches, etc.
- Migration scripts and schema definitions for the chosen storage engine.
- Data serialization / deserialization helpers.

## What must NOT be placed here
- Game‑play simulation logic.
- UI or client‑side code.

## Future expected files
- `db_connection.gd`
- `account_repository.gd`
- `match_repository.gd`
- `migration_tool.ps1`
