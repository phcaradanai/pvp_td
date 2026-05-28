# Godot Scene Prototype (M25)

A Godot 4.6.2 scene prototype that visualizes the validated PvP flow with an interactive draft phase. No real combat or networking.

## Purpose

Bridges the gap between the Node.js JS prototype (M10A-M10C) and a full Godot game engine integration. Demonstrates the 7-screen PvP flow using pure GDScript with interactive shared-pool drafting — no game logic, real networking, or backend calls.

## Structure

```
godot_prototype/
├─ project.godot              # Godot 4 project config
├─ scenes/
│  └─ pvp_flow_prototype.tscn # Main scene
├─ scripts/
│  ├─ pvp_flow_state.gd       # PvpFlowState (RefCounted) — navigation, JSON data, draft logic
│  ├─ pvp_flow_view_model.gd  # PvpFlowViewModel (RefCounted) — display mapping
│  └─ pvp_flow_controller.gd  # extends Control — wires UI to state/vm
├─ data/
│  └─ sample_pvp_flow.json    # Screen data + shared pool items for all 7 screens
└─ tests/
   └─ README.md               # Manual test instructions
```

## Screens (7 total)

1. `arsenal_preview` — Both players' cost-limited arsenals
2. `shared_pool_preview` — Interactive shared pool draft (clickable items, alternating turns)
3. `draft_preview` — Turn-based draft summary
4. `planning_preview` — Tower/creep placement showing drafted loadouts (placeholder grid)
5. `battle_preview` — Match simulation showing drafted units (placeholder, no real combat)
6. `result_preview` — Authoritative server result
7. `reward_preview` — Normalized post-match rewards

## Architecture

- **PvpFlowState** (`class_name`, extends `RefCounted`): Holds `current_index`, `screen_data`, `pool_items`, `draft_picks_a/b`, `current_drafter`, `draft_locked`, navigation, draft logic, and JSON loading. Not a node.
- **PvpFlowViewModel** (`class_name`, extends `RefCounted`): Pure mapping from state to flat display strings. Static `build(state, feedback)` factory. Computes `pool_item_cards`, `show_pool_items`, `lock_draft_enabled`. Not a node.
- **PvpFlowController** (extends `Control`): Owns `@onready` node references, creates State and ViewModel instances, wires button signals, dynamically builds pool item buttons via `_rebuild_pool_buttons()`, calls `_render()` on every state change.

## Draft Rules (Local Only)

- Budget max: 10 per player
- Players alternate picks: Player A → Player B → Player A → ...
- Cannot pick an already-drafted item
- Cannot exceed your budget
- Lock Draft button appears only on the draft screen; enabled when both players have ≥1 tower AND ≥1 creep
- Next button disabled until `draft_locked == true`
- Reset clears draft and returns to screen 1

## How to Open

1. Install [Godot 4.6.2](https://godotengine.org/download)
2. Open Godot, click "Import", and select `godot_prototype/project.godot`
3. Press F5 (Run) to launch the prototype
4. Click items in the Shared Pool to draft them; click Lock Draft when ready; use Next to advance

## Constraints

- NO real combat
- NO real networking or WebSocket
- NO backend API calls
- NO real matchmaking or database
- NO complex VFX
- NO global mutable singletons
- UI does not mutate game state directly — all state changes go through PvpFlowState methods

## Relationship to JS Prototype

The JS prototype (`client/prototype/`) uses 6 screens. This Godot prototype splits into 7 screens (`planning_preview` + `battle_preview`) to make the distinction explicit. Both prototypes read from sample data files; neither implements real combat logic.
