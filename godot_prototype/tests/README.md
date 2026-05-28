# Godot Prototype Manual Tests

These tests require Godot 4.6.2 to run. Structural and static-content tests are automated via Node.js.

## Setup

1. Install Godot 4.6.2 from https://godotengine.org/download
2. Open `godot_prototype/project.godot` via File > Import in Godot
3. Press F5 or the Run button to start

## Test Checklist

### T1 — Initial Load
- [ ] Scene opens without errors in the Godot editor output
- [ ] First screen shown is "Arsenal Preview" (phase title)
- [ ] Progress label shows "Screen 1 / 7"
- [ ] Prev button is disabled on first screen
- [ ] Next and Lock Draft buttons are visible but Lock Draft is hidden on non-draft screens

### T2 — Forward Navigation (pre-draft)
- [ ] Clicking Next from Arsenal Preview advances to Shared Pool Preview
- [ ] Lock Draft button becomes visible on Shared Pool Preview
- [ ] Pool items are shown as buttons in the center panel
- [ ] Next button is disabled on Shared Pool Preview (draft not locked)

### T3 — Draft Interaction
- [ ] Clicking a pool item drafts it for the current player (Player A first)
- [ ] Player A panel updates with the drafted item and budget used
- [ ] Turn indicator changes to Player B after Player A picks
- [ ] Player B picks their items; panel updates accordingly
- [ ] Cannot click an already-drafted item (button disabled, shows [DRAFTED])
- [ ] Cannot exceed budget (button disabled when cost > remaining)
- [ ] Lock Draft button remains disabled until both players have ≥1 tower AND ≥1 creep
- [ ] Lock Draft button enables when both players meet the requirement
- [ ] Error feedback shown in center panel for invalid actions

### T4 — Lock Draft and Advance
- [ ] Clicking Lock Draft locks the draft
- [ ] Pool item buttons disappear after lock
- [ ] Lock Draft button hides after lock
- [ ] Next button enables after lock
- [ ] Clicking Next advances to Draft Preview showing final loadouts

### T5 — Planning Phase with Draft Loadouts
- [ ] Planning Preview shows drafted items for each player (not static placeholder text)
- [ ] Items shown as "Name [category] → Lane N" format

### T6 — Battle Phase with Draft Loadouts
- [ ] Battle Preview shows drafted items for each player
- [ ] Items shown as "- Name [category]" format

### T7 — Back Navigation
- [ ] Clicking Prev from any middle screen returns to previous screen
- [ ] Prev button disables on first screen
- [ ] Returning to Shared Pool Preview from Draft Preview shows locked state

### T8 — Reset
- [ ] Clicking Reset from any screen returns to screen 1 (Arsenal Preview)
- [ ] Draft is fully cleared — pool items show as available again on Shared Pool Preview
- [ ] Progress label resets to "Screen 1 / 7"
- [ ] current_drafter resets to Player A

### T9 — Data Integrity
- [ ] Footer text shows "PvP Tower Tactics — Prototype M25 | No real combat or networking"
- [ ] No Godot errors or warnings in editor output during navigation

### T10 — Constraint Verification
- [ ] No network calls are made (verify in OS network monitor)
- [ ] No external files are read other than sample_pvp_flow.json
- [ ] No global autoload singletons used

## Known Limitations

- Planning and Battle screens have placeholder grid/combat content only.
- Font sizes are set per-node via theme_override. No custom theme file.
- Layout proportions are equal thirds; no responsive design.
- Draft is local only — no server, no matchmaking, no real opponent.
