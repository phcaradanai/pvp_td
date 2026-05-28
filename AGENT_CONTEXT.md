# AGENT_CONTEXT.md

## Project Goal
Create a premium 1v1 PvP Tower Tactics game focused on strategic depth, fairness, and long‑term retention.

## Game Concept
- Players assemble a cost‑limited arsenal of towers, creeps, spells, relics, and guardians.
- Both players' selections are merged into a **Shared Match Pool**.
- Draft phase: each player alternately picks from the shared pool.
- No permanent PvP stat advantage from unlocks; unlocks add new options, cosmetics, or identity.
- Visuals: stylized 2.5D/3D, premium aesthetic, modest unit counts.

## Current Milestone
**M8 – Mock Battle Result Preview** (complete).

## Core Design Pillars
- **Fairness‑First**: Shared pool draft, cost‑limited arsenals, no permanent advantages.
- **Data‑Driven Balance**: All stats, costs, and rules defined in data files.
- **Modular Architecture**: Separate client and backend modules, thin glue layers.
- **Premium Visuals**: High‑quality 2.5D assets, performance‑budget aware.
- **Retention Loop**: Unlocks and cosmetics drive player identity without affecting competitive balance.

## Technical Rules
- No giant files or god objects – keep files ≤ 400 lines, controllers ≤ 500 lines.
- Functions ≤ 60 lines where possible.
- All balance data externalized (JSON/YAML).
- UI never mutates gameplay state directly.
- Client is non‑authoritative; server decides match outcome, rewards, and unlock progression.
- No hard‑coded values in gameplay scripts.

## PvP Fairness Rules
1. **Shared Pool Draft** is the primary fairness mechanic.
2. Cost‑limit enforces equal spending power.
3. Post‑match rewards are normalized across players.
4. Ranked matchmaking uses hidden ELO and enforces anti‑cheat.

## Unlock Rules
- Unlocks may add new towers/creeps/spells/etc. or cosmetics.
- Unlocks **never** change base stats, costs, or give direct combat advantage.
- Unlocks are tiered; higher tiers unlock aesthetic variations and new playstyles.

## Current Planned Architecture
- **Client** (`client/`): core, data, match, arsenal, draft, visuals, UI, net, tests.
- **Backend** (`backend/`): account, inventory, unlock, matchmaking, room, draft, match, reward, websocket, persistence, tests.
- **Shared Data** (`data/`): JSON files for towers, creeps, spells, relics, guardians, arsenal_rules, draft_rules, reward_rules, unlock_tree.
- Communication via WebSocket with authoritative server state.

## How Future Agents Should Work
- Follow the documented coding standards and file size limits.
- Implement features incrementally per milestone, updating the TODO board.
- Write unit and integration tests alongside code changes.
- Keep documentation up‑to‑date in the `docs/` folder.
- Respect the PvP fairness and unlock constraints.
- When in doubt, ask for clarification before implementing.

## Next Recommended Tasks
- **M9 – Local End-to-End Loop Harness**: Wire LocalMatchSkeleton + LocalPhaseController + MockBattleResultPreview into one complete deterministic local flow test. Note: State clearly no real combat/UI/networking/rewards has been implemented yet.
