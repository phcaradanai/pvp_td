# GAME_DESIGN.md

## High‑Level Pitch
Premium 1v1 PvP Tower Tactics where each match is a strategic draft of towers, creeps, spells, relics, and guardians. Players build a cost‑limited arsenal, draft from a shared pool, and battle in a fast‑paced, visually striking 2.5D arena.

## Core Gameplay Loop
1. **Arsenal Selection** – Players choose a set of items within a fixed cost budget.
2. **Shared Pool Merge** – Both selections are combined into a single pool.
3. **Draft Phase** – Players alternate picking items from the pool until budgets are spent or the pool is empty.
4. **Match** – The drafted arsenals battle in an authoritative simulation.
5. **Reward & Unlock** – Post‑match rewards normalize across players; unlocks grant new options or cosmetics.

## Match Flow
- **Pre‑match**: UI for cost‑budget selection.
- **Pool Creation**: Server merges selections, enforces fairness.
- **Draft**: Turn‑based pick UI, live updates.
- **Simulation**: Server runs deterministic combat, decides winner.
- **Post‑match**: Rewards distributed, unlocks evaluated.

## Arsenal Selection
- Players pick from towers, creeps, spells, relics, guardians.
- Each item has a cost; total cost must not exceed the budget.
- Selections are stored client‑side but validated server‑side.

## Shared Pool Draft
- The combined pool contains every unique item chosen by either player.
- Draft order is fixed (e.g., 1‑2‑2‑1) to ensure fairness.
- Drafted items are removed from the pool and added to the player’s arsenal.

## Win Condition
- The match ends when one player’s core (or base) health reaches zero.
- Victory is determined by server‑side simulation.

## Retention Loop
- **Cosmetic Unlocks** – Skins, visual effects, avatar items.
- **New Playstyles** – Unlocks provide additional towers/spells, expanding strategic depth without altering existing balance.
- **Ranked Ladder** – Competitive play encourages regular participation.

## What the Game Is
- Strategic, cost‑limited PvP.
- Data‑driven balance for rapid iteration.
- Premium visual polish with 2.5D/stylized 3D graphics.
- Fair, skill‑based competition.

## What the Game Is NOT
- Large‑scale tower‑defense with massive unit counts.
- Single‑player story‑driven campaign.
- Pay‑to‑win power advantages.
- Hard‑coded balance values.

## Prototype Flow (M24 — First Playable Prototype)

A minimal Godot 4.6.2 scene prototype (`godot_prototype/`) demonstrates the full 7-screen PvP flow with placeholder data:

`arsenal_preview → shared_pool_preview → draft_preview → planning_preview → battle_preview → result_preview → reward_preview`

This prototype contains no real combat, networking, or backend calls. It validates that the engine can render each phase of the match flow with correct screen transitions. A parallel JS prototype (`client/prototype/`) uses 6 screens; the Godot prototype makes `planning_preview` and `battle_preview` explicit phases.
