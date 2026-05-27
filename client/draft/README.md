# client/draft/README.md

## Purpose
Manages the UI and client‑side logic for the Shared Pool Draft phase.

## What belongs here
- Draft UI panels showing available items and budgets.
- Turn‑order handling (display only; server controls actual picks).
- Interaction with `client/data` for item information.
- Dispatching draft pick actions through `client/net`.

## What must NOT be placed here
- Validation of draft legality beyond UI hints (server must enforce).
- Match outcome calculations.
- Direct modifications to authoritative match state.

## Future expected files
- `draft_controller.gd` – coordinates UI updates and player input.
- `draft_state.gd` – client‑side snapshot of the draft.
- `pick_button.gd` – reusable UI component for selecting items.
