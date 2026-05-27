# client/ui/README.md

## Purpose
User interface components that display game information and capture player input.

## What belongs here
- Menus, panels, buttons, HUD elements.
- UI logic that reflects client‑side state (e.g., budget, draft options, match timers).
- Event dispatchers that forward player actions to the appropriate client modules via the event bus.

## What must NOT be placed here
- Direct mutation of game mechanics or authoritative state.
- Networking or server‑validation code.
- Heavy gameplay calculations.

## Future expected files
- `main_menu.gd`
- `draft_panel.gd`
- `match_hud.gd`
- `resource_bar.gd`
