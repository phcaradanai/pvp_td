# client/unlocks/README.md

## Purpose
UI and preview for cosmetic and new‑option unlocks that the player has earned.

## What belongs here
- Screens showing available skins, particle trails, avatar accessories.
- UI for unlocking new towers/spells/etc. (adds the option to the player's arsenal list).
- Interaction with `client/data` to load unlock definitions.

## What must NOT be placed here
- Direct modifications to server‑side unlock state.
- Gameplay balance logic; unlocks only expose new assets or options.

## Future expected files
- `unlock_panel.gd` – UI for browsing unlocks.
- `unlock_preview.gd` – shows cosmetic preview.
