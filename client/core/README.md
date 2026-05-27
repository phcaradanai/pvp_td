# client/core/README.md

## Purpose
Core utilities and engine bootstrap code for the client.

## What belongs here
- Initialization scripts, global helpers, service locators.
- Low‑level utilities that are reused across other client modules.

## What must NOT be placed here
- Gameplay‑specific logic (draft, match, economy, etc.).
- Server‑side authoritative code.

## Future expected files
- `init.gd` – entry point for the client.
- `logger.gd` – centralized logging utility.
- `event_bus.gd` – simple event system for decoupled communication.
