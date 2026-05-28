# client/README.md

## Purpose
This top‑level client folder contains all code that runs on the player's device.

## What belongs here
- Sub‑folders for core engine utilities, data loading, match view state, player‑side systems (arsenal, draft, economy, reward, unlocks, visuals, UI), networking, and tests.
- Pure‑client logic that does **not** decide authoritative outcomes.

## What must NOT be placed here
- Server‑side authority code (match resolution, reward calculation, anti‑cheat).
- Direct database or persistence layers.
- Heavy backend services.

### Prototype Client Structure
- `prototype/`
  - `src/`: Client-side logic separating state management (`prototype_state.js`), user flow transitions (`prototype_flow.js`), and view model mapping (`prototype_view_model.js`) away from raw validator logic.
  - `visual/`: A lightweight visual prototype shell written in HTML/CSS/JS with a built-in Scenario Runner to browse states deterministically without a heavy game engine. It includes a reward preview mockup.
  - `data/`: Sample JSON payloads (including multiple pre-generated scenarios and reward previews) matching what a real backend connection would emit for pre-match phases.
  - `tests/`: Extensive flow logic tests.

## Future expected files
- `core/`: Client core mechanics and state managers.
- `data/` – client‑side data loaders for JSON/YAML.
- `match/` – client‑side representation of match state (read‑only).
- `arsenal/` – UI and validation for building player arsenals.
- `draft/` – UI for the shared‑pool draft.
- `towers/`, `creeps/`, `spells/` – prefab definitions and visual assets.
- `economy/` – cost calculations, budget UI.
- `reward/` – preview of post‑match rewards (non‑authoritative).
- `unlocks/` – UI for cosmetics and new option unlocks.
- `visuals/` – shaders, post‑process effects, 2.5D rendering helpers.
- `ui/` – generic UI components, menus.
- `net/` – WebSocket client, message handling.
- `tests/` – client‑side unit/integration test suite.
