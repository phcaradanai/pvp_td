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
**M25 Godot Draft Interaction Prototype**.

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
- **Current milestone**: M25 Godot Draft Interaction Prototype
- **Latest completed work**: M25 dead-end fix — draft viability guard in Godot 4.6.2; picks that would leave the other player unable to satisfy minimums are rejected with readable feedback; deadlock detection shows "Draft cannot be completed. Reset draft."; DraftStatusLabel shows live requirement status; 388 tests passing
- **Next recommended task**: Real Combat Prototype (M26) or Real DB Adapter Design (M26B) or WebSocket Skeleton (M26C)

## Strict Constraints
- **NO REAL COMBAT YET**: We have not implemented any actual tower firing, creep movement, grid mapping, or real-time economy. Everything is pure pre-match logic validation and scenario mockups.
- **NO NETWORKING YET**: Everything is single-player local validation of deterministic JSON states. No real HTTP or WebSocket server runtime.
- **NO REWARDS BACKEND YET**: We have placeholder deterministic reward logic, backend contracts, and visual mockups, but no database, payment, or reward persistence has been implemented yet.
- **NO API RUNTIME YET**: We have testable route handlers acting as an API skeleton, but no live web server or auth middleware exists.
- **NO REAL AUTH YET**: We have pure contract-based session/identity validation, but no JWT signing, token verification, OAuth, or login system exists.
- **NO REAL PERSISTENCE YET**: Persistence contracts and in-memory test doubles exist, but no real database adapter, migrations, transactions, login/JWT, network runtime, or real combat has been implemented.
- **NO API PERSISTENCE RUNTIME YET**: Protected validate-and-persist handlers exist as pure functions with injected repositories, but no production HTTP server, global persistence runtime, real DB, login/JWT, WebSocket runtime, matchmaking runtime, or real combat has been implemented.
- **NO REAL IDEMPOTENCY STORE YET**: Pure idempotency contracts and an in-memory test store exist, but no Redis, DB unique constraint, production middleware, login/JWT, network runtime, or real combat has been implemented.
- **NO API IDEMPOTENCY RUNTIME YET**: Idempotent protected route handlers exist as pure functions with injected stores, but no Redis, DB, login/JWT, production middleware, network runtime, WebSocket runtime, or real combat has been implemented.
- **NO REAL SESSION STORE RUNTIME YET**: Pure session store contracts and an in-memory test double exist, but no Redis, DB, login, JWT signing/verification, production middleware, network runtime, WebSocket runtime, or real combat has been implemented.
- **NO STORE-BACKED API RUNTIME YET**: Store-backed protected and idempotent API handlers exist as pure functions with injected stores, but no Redis, DB, login/JWT, production middleware, network runtime, WebSocket runtime, or real combat has been implemented.
- **NO REAL MATCH STORE RUNTIME YET**: Pure match store contracts and an in-memory test double exist, but no real database match adapter, matchmaking runtime, WebSocket match state sync, distributed concurrency, or real combat has been implemented.
- **NO API MATCH STORE RUNTIME YET**: Store-match protected and idempotent API route handlers exist as pure functions with injected stores, but no real database match adapter, matchmaking runtime, WebSocket runtime, JWT, login system, production HTTP server, or real combat has been implemented.
- **NO REAL GODOT COMBAT YET**: The Godot 4.6.2 scene prototype has interactive drafting but no real tower firing, creep movement, grid logic, economy, WebSocket, backend API calls, or matchmaking. Planning and battle screens are placeholder only.
