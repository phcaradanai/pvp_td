# ARCHITECTURE_NOTES.md

## Why PvP‑First?
- Competitive balance is the core experience; single‑player modes are secondary.
- Community‑driven ladders and rankings drive long‑term retention.
- A focused PvP scope reduces scope creep and allows premium polish.

## Why Shared Pool Draft?
- Guarantees **fairness** regardless of who has unlocked stronger options.
- Encourages strategic decision‑making on limited resources.
- Prevents “meta lock‑in” where one player consistently dominates.

## Why Unlocks Must Not Create Permanent Stat Advantage?
- Keeps the ranked ladder merit‑based.
- Allows monetization via cosmetics and new playstyles without power‑gaming.
- Supports a healthy player ecosystem where new players can compete.

## Why Data‑Driven Balance?
- Enables rapid iteration and live‑tuning without code changes.
- Centralizes all numeric values in JSON/YAML, facilitating A/B testing.
- Reduces risk of hard‑coded bugs and eases localisation.

## Why Client Must Not Be Authoritative?
- Prevents cheating and desynchronisation.
- Server validates all actions, determines victory, rewards, and unlock progression.
- Allows future scalability to cloud‑based match hosting.

## Components

### 1. Client (`client/`)
- Thin frontend that renders server‑driven state.
- Handles user inputs (taps, drags, UI).
- Includes `client/prototype/`: A lightweight UI prototype foundation visualizing the validated loop. Validation logic remains separate from client view state. Future Godot scenes should consume view models or exported state, not duplicate rules.

### Prototype Architecture (M10A - M10C)
To bridge the gap between validation code and a full game engine, a **Client Prototype Foundation** (`client/prototype`) was built.
1. `prototype_state.js`: A JSON-serializable state tree representing the active UI session.
2. `prototype_flow.js`: A deterministic state machine advancing through `arsenal_preview` -> `shared_pool_preview` -> `draft_preview` -> `phase_flow_preview` -> `result_preview` -> `reward_preview`.
3. `prototype_view_model.js`: A mapping layer that consumes raw validation output (e.g. `shared_pool` dictionaries) and flattens them into safe layout sections (e.g. `categories` arrays). UI layers must ONLY bind to the view model.
4. **Visual Shell** (`client/prototype/visual`): A plain HTML/CSS/JS shell rendering the UI states without a real game engine.
5. **Scenario Runner**: The visual shell supports hot-swapping between full E2E match states (e.g. draws, core HP overrides) proving the UI cleanly renders all scenarios without executing any game code. The client reward preview consumes sample/contract data, while the backend remains authoritative. Future APIs can replace sample reward data.

### Godot Scene Prototype (M24 → M25)

To validate the 7-screen PvP flow in a real game engine, a **Godot 4.6.2 Scene Prototype** (`godot_prototype/`) was built and extended with interactive drafting.

- **PvpFlowState** (`class_name`, extends `RefCounted`): Loads `sample_pvp_flow.json`, holds `current_index`, `screen_data`, `pool_items`, `draft_picks_a/b`, `current_drafter`, `draft_locked`. Provides navigation, draft logic (`pick_shared_pool_item`, `lock_draft`, `reset_draft`, `can_advance_from_current_screen`), and budget helpers. Not a node.
- **PvpFlowViewModel** (`class_name`, extends `RefCounted`): Pure mapping from state to flat display strings via static `build(state, feedback)`. Computes `pool_item_cards`, `show_pool_items`, `lock_draft_enabled`. Screen-routing: draft screen uses `_build_draft_panels`; planning/battle screens use `_build_planning_panels`/`_build_battle_panels` when `draft_locked`; all others read from `screen_data`. Not a node.
- **PvpFlowController** (extends `Control`): Owns `@onready` node references, creates State and ViewModel, wires button signals including LockDraftButton. Dynamically builds pool item buttons via `_rebuild_pool_buttons()` using `.bind()` for signal connections (not lambdas — avoids GDScript 4 loop-variable capture issue). Stores `_last_feedback` and passes it to `build()`. Calls `_render()` on every state change. No global mutable singletons.
- **7 screens**: `arsenal_preview → shared_pool_preview → draft_preview → planning_preview → battle_preview → result_preview → reward_preview`.
- Godot prototype has no real combat, networking, WebSocket, backend calls, matchmaking, or database.
- Structure and content verified by `tools/validation/tests/godot_prototype_structure.test.mjs` (10 tests) and `tools/validation/tests/godot_draft_interaction_structure.test.mjs` (36 tests).

## Proposed Client Module Structure
```
client/
├─ core/            # Engine bootstrap, utilities
├─ data/            # Runtime loading of JSON data files
├─ match/           # Match state (client‑side view only)
├─ arsenal/         # Player arsenal building UI & validation
├─ draft/           # Draft UI, turn logic (client‑side visuals)
├─ towers/          # Tower prefabs, visual assets
├─ creeps/          # Creep prefabs, visual assets
├─ spells/          # Spell definitions, VFX
├─ economy/         # Cost calculations, budget UI
├─ reward/          # Reward preview UI (non‑authoritative)
├─ unlocks/         # Cosmetic unlock UI, preview
├─ visuals/         # Shaders, post‑process, 2.5D rendering helpers
├─ ui/              # Generic UI components, menus
├─ net/             # WebSocket client, message handling
└─ tests/           # Client‑side unit/integration tests
```

## Proposed Backend Module Structure

*Confirmed folder structure:* `client/`, `backend/`, `data/` with sub‑modules as defined in PROJECT_STRUCTURE.md.
*Client‑backend separation:* client holds presentation and local state; backend holds authoritative match simulation, reward, unlock, and persistence.
*Data‑driven plan:* all balance, cost, and rule definitions will live in `data/` JSON/YAML files.
*UI rule:* UI components must not directly mutate gameplay state; they only dispatch actions to client logic.
*Authority rule:* client never decides match outcome or rewards; server is authoritative.
*Balance config rule:* future balance values must be stored in `data/` schemas, never hard‑coded in code.

```
backend/
├─ account/         # Player profiles, authentication
├─ inventory/       # Owned items, cosmetics
├─ unlock/          # Unlock tree, progression logic
├─ matchmaking/    # Ranked/ELO, lobby creation
├─ room/            # Match room lifecycle management
├─ draft/           # Server‑side pool merging & draft validation
├─ match/           # Authoritative match simulation, result calc
├─ reward/          # Reward distribution, normalization
├─ websocket/       # Real‑time communication layer
├─ persistence/     # Database persistence, backups
└─ tests/           # Backend unit/integration tests
```

## Dependency Rules
- Client depends **only** on `client/data` for static configs; never on backend logic.
- Backend may reference client‑side schemas for validation but not client code.
- Shared data schemas reside in top‑level `data/` and are versioned.
- No circular dependencies; modules communicate via defined message contracts.

## Match Flow (High Level)
1. **Pre‑match Validation**: Client uses `local_match_skeleton.mjs` to validate arsenals, build shared pool, and validate drafts. This creates a deterministic `ready_to_start` state. (Test harness before gameplay).
2. **Phase Advancement**: `local_phase_controller.mjs` handles advancing the placeholder phases. (Future combat must be implemented separately).
3. **Mock Result**: `mock_battle_result_preview.mjs` generates placeholder results from the `result_preview` phase. Future real combat resolver must replace this module, not mix into it.
4. **Integration Harness**: `local_e2e_loop_harness.mjs` wires these modules end-to-end to prove the loop natively connects without duplicating validation or phase logic. Future gameplay loop must replace this cleanly.
5. **Reward/Unlock Mock**: `reward_unlock_mock.mjs` is separate from match result generation. Future backend should own authoritative rewards; the client must not decide final rewards in production.
7. **Backend API Skeleton**: `backend/api` contains HTTP route handlers that wrap the authoritative contracts (`match_result_contract`, `reward_claim_contract`). These handlers isolate HTTP request/response parsing from the domain logic and explicitly do not persist data yet. Future server runtimes will invoke these handlers and add authentication, rate-limiting, and persistence.
8. **Auth / Session Contract**: `backend/auth/auth_session_contract.mjs` provides identity validation as a separate layer from route handlers. `validateRequestSession` checks client-claimed sessions against the server-side session store (currently a `server_context.known_sessions` fixture). `validateMatchParticipation` ensures only actual match participants can submit results or claim rewards. In production, `server_context` will be replaced by a real session store and the contracts will be invoked as middleware before route handlers.
3. **Pre‑match**: Players select arsenals (cost‑limited) -> sent to server.
4. **Pool Merge**: Server combines selections into a Shared Pool.
5. **Draft Phase**: Server orchestrates turn‑based picks, broadcasting updates.
6. **Match Initialization**: Future gameplay must start ONLY after match_state phase is `ready_to_start`.
7. **Match Simulation**: Server runs authoritative simulation, determines winner.
8. **Post‑Match**: Server normalizes rewards, updates unlock progress, sends results.
9. **Client**: Receives final state, updates UI, plays VFX/animations.

## Draft Flow (Detailed)
- **Initialize**: Server creates DraftState with pool, player budgets.
- **Turn Loop**: Alternate player picks an item from pool.
  - Validate cost, item availability.
  - Update player’s drafted list, deduct cost.
- **End Condition**: Both players have spent their budget or pool empty.
- **Result**: Drafted arsenals are locked; sent to Match module.

## Reward/Unlock Flow
- **Reward Generation**: Server generates raw reward tokens based on performance.
- **Normalization**: Apply rank‑based scaling to ensure fairness.
- **Unlock Application**: Unlock tree is consulted; only cosmetic or new‑option unlocks are granted.
- **Persistence**: Update player profile in `backend/inventory` and `backend/unlock`.

## Backend Persistence Design
- `backend/persistence` defines replaceable repository ports for profiles, sessions, matches, match results, and reward claim previews.
- Real database adapters must implement the same methods as the pure contracts in `backend/persistence/repository_contracts.mjs`.
- In-memory repositories exist only for deterministic contract tests and must clone input/output to prevent mutation leaks.
- The persistence service saves validated match results and reward claim previews only after API/auth/contracts have established session validity, match participation, and accepted backend contract output.
- Persistence does not calculate rewards or unlocks. Reward calculation remains in backend contracts and validation modules.
- Stored unlock progression must preserve the no permanent PvP stat advantage rule.

## Backend API Persistence Integration
- Protected API persistence routes follow this order: request validation -> auth/session validation -> match participation validation -> backend contract validation -> persistence service.
- Repositories are injected into handlers. There is no global repository singleton.
- Failed request, auth/session, participation, match contract, or reward contract validation must not persist anything.
- Client-submitted rewards are still rejected by the match result contract before persistence can run.
- The integration still uses in-memory repositories as test doubles only; no real database adapter exists yet.

## Idempotency Contract
- `backend/idempotency` defines pure request fingerprinting, replay detection, conflict detection, and completed response storage.
- Future API flow should be: request -> idempotency check -> auth/session -> participation -> contract -> persistence -> save idempotency result.
- Replaying the same `idempotency_key` with the same request fingerprint returns the stored response.
- Reusing the same `idempotency_key` with a different payload fails with `IDEMPOTENCY_CONFLICT`.
- Duplicate match result and reward claim requests must not create duplicate reward writes or conflicting match result writes.
- The in-memory idempotency store is a deterministic test double only. No Redis, DB unique constraint, or production middleware exists yet.

## API Idempotency Integration
- Idempotent protected API routes follow this order: request -> idempotency check -> auth/session -> participation -> contract -> persistence -> save idempotency result.
- If the idempotency check returns replay, the handler returns the stored response and does not call persistence again.
- If the same `idempotency_key` is reused with a different payload, the handler returns conflict and does not persist.
- Idempotency success records are saved only after successful persistence. Failed auth, participation, contract validation, client-submitted reward rejection, or persistence failure does not save a completed idempotency response.
- The integration still uses injected in-memory stores only. No Redis, DB unique constraint, or production middleware has been added.

## Session Store Contract
- `backend/session` defines a replaceable session store port for future auth/session validation.
- The current auth/session contract still supports `server_context.known_sessions` fixtures; the session store contract is the next step toward injected runtime session lookup.
- Future protected API flow should be: request -> idempotency -> session store validation -> participation -> backend contract -> persistence.
- Store-backed validation accepts only active, non-revoked sessions. Unknown, mismatched, revoked, or inactive sessions fail before protected PvP actions can proceed.
- The in-memory session store is a deterministic test double only. No Redis, database adapter, JWT verification, login flow, or production middleware exists yet.

## API Session Store Integration
- Store-backed protected API routes follow this order: request -> idempotency when applicable -> session store -> match participation -> backend contract -> persistence -> idempotency result save when applicable.
- `sessionStore` is injected per handler call. There is no global mutable session singleton.
- Failed store-backed session validation must not persist match results or reward claims and must not save idempotency success responses.
- Existing fixture-based `server_context.known_sessions` handlers remain for compatibility, while the new store-backed handlers define the preferred future API boundary.
- A future Redis or DB session adapter can replace the in-memory store by preserving the `backend/session` contract.

## Match Store Contract

- `backend/match_store` defines a replaceable match store port for future API handler injection.
- The current `server_context.match_context` fixture path remains for backward compatibility; the match store contract is the next step toward injected runtime match lookup.
- Future protected API flow should be: request → idempotency → sessionStore → matchStore → backend contract → persistence.
- Store-backed match validation accepts only matches that exist in the injected store. Unknown matches fail before protected PvP actions can proceed.
- Store-backed participation validation checks that the requesting player is in `allowed_player_ids` and that the match status is a valid value.
- The in-memory match store is a deterministic test double only. No real database adapter, matchmaking runtime, WebSocket match sync, or production middleware exists yet.

## API Match Store Integration

- Store-match protected API routes follow this order: request → idempotency when applicable → sessionStore → matchStore → backend contract → persistence → idempotency result save when applicable.
- `matchStore` is injected per handler call. There is no global mutable match singleton.
- Client-submitted `server_context.match_context` and `server_context.result_context` are ignored by store-match handlers — the match store is the authoritative source for match context.
- After `validateMatchParticipationFromStore` confirms the player is in the match, a second `matchStore.getMatch` call retrieves `allowed_player_ids` for the backend contract's `server_context`. The `match_status` and `match_phase` come from `participation_context`.
- Failed match store validation must not persist match results or reward claims and must not save idempotency success responses.
- Existing fixture-based and session-store-only handlers remain for compatibility, while the store-match handlers define the preferred future API boundary.
- A future real database match adapter can replace the in-memory store by preserving the `backend/match_store` contract.

## Open Design Questions (for future agents)
- Exact JSON schema for `unlock_tree.json` and how tiered cosmetic tiers are represented.
- Whether draft will support “ban” mechanics in later updates.
- How to handle match replay data for analytics.

---
*All architecture decisions prioritize PvP fairness, modularity, and data‑driven design.*
