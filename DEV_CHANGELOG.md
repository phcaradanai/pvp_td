# DEV_CHANGELOG.md

## 2026-05-28
- **Task name**: M25 Dead-end Fix — Draft Viability Guard
- **Files created**:
  - `tools/validation/tests/godot_draft_viability_structure.test.mjs` (22 content-grep tests)
- **Files updated**:
  - `godot_prototype/scripts/pvp_flow_state.gd` (added: can_pick_item_without_breaking_draft, is_draft_deadlocked, get_player_requirement_status, get_remaining_available_items, is_draft_completable_after_pick, _picks_status; updated pick_shared_pool_item to run viability guard before mutating state)
  - `godot_prototype/scripts/pvp_flow_view_model.gd` (added: draft_status_text field, viable bool per pool_item_card, _req_status_text, _build_draft_status_text, _missing_requirements_text; player panels show Tower ✓/✗ Creep ✓/✗; center shows deadlock message)
  - `godot_prototype/scripts/pvp_flow_controller.gd` (added _draft_status_label @onready at DraftStatusLabel; _render binds vm.draft_status_text; _rebuild_pool_buttons adds ⚠ indicator for non-viable affordable items; viability-blocked buttons stay enabled)
  - `godot_prototype/scenes/pvp_flow_prototype.tscn` (added DraftStatusLabel node in Controls HBoxContainer)
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
  - `AGENT_CONTEXT.md`
- **Tests**: 388 pass (366 existing + 22 new viability structure tests), validate:data passes

## 2026-05-28
- **Task name**: M25 Godot Draft Interaction Prototype
- **Files created**:
  - `tools/validation/tests/godot_draft_interaction_structure.test.mjs` (36 content-grep + JSON structure tests)
- **Files updated**:
  - `godot_prototype/data/sample_pvp_flow.json` (added `shared_pool` key with 6 pool items; updated draft/planning/battle screen_data)
  - `godot_prototype/scripts/pvp_flow_state.gd` (draft state: pool_items, budget_max, draft_picks_a/b, current_drafter, draft_locked; new methods: pick_shared_pool_item, lock_draft, reset_draft, can_advance_from_current_screen, budget_used_for, budget_remaining_for, get_item_by_id, is_drafted)
  - `godot_prototype/scripts/pvp_flow_view_model.gd` (build(state, feedback); pool_item_cards, show_pool_items, lock_draft_enabled; _build_draft_panels, _build_planning_panels, _build_battle_panels)
  - `godot_prototype/scripts/pvp_flow_controller.gd` (pick_shared_pool_item, lock_draft, reset_draft, can_advance_from_current_screen, _rebuild_pool_buttons with .bind(), LockDraftButton wired)
  - `godot_prototype/scenes/pvp_flow_prototype.tscn` (LockDraftButton in Controls; PoolScrollContainer + PoolItemsContainer in CenterPanel/VBox)
  - `godot_prototype/README.md` (M25 draft interaction docs)
  - `godot_prototype/tests/README.md` (updated manual test checklist for draft interaction)
  - `ARCHITECTURE_NOTES.md` (Godot Scene Prototype section updated for M25)
  - `AGENT_CONTEXT.md` (milestone updated to M25)
  - `TODO.md` (M25 complete)
- **Tests**: 366 pass (330 existing + 36 new draft interaction structure tests), validate:data passes

## 2026-05-28
- **Task name**: M24 Godot Scene Prototype
- **Files created**:
  - `godot_prototype/data/sample_pvp_flow.json`
  - `godot_prototype/scripts/pvp_flow_state.gd`
  - `godot_prototype/scripts/pvp_flow_view_model.gd`
  - `godot_prototype/scripts/pvp_flow_controller.gd`
  - `godot_prototype/scenes/pvp_flow_prototype.tscn`
  - `godot_prototype/project.godot`
  - `godot_prototype/README.md`
  - `godot_prototype/tests/README.md`
  - `tools/validation/tests/godot_prototype_structure.test.mjs`
- **Files updated**:
  - `tools/validation/validate_data.mjs` (separate Godot data check block)
  - `ARCHITECTURE_NOTES.md` (Godot Scene Prototype section)
  - `docs/GAME_DESIGN.md` (Prototype Flow section)
  - `docs/PVP_RULES.md` (Godot Prototype section)
  - `TODO.md` (M24 complete, M25 options)
  - `AGENT_CONTEXT.md` (milestone M24, NO REAL GODOT COMBAT YET constraint)
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Created a minimal Godot 4.6.2 scene prototype demonstrating the full 7-screen PvP flow (arsenal_preview → shared_pool_preview → draft_preview → planning_preview → battle_preview → result_preview → reward_preview). Architecture follows the Option A pattern: PvpFlowState and PvpFlowViewModel are `class_name RefCounted` instances (not nodes); PvpFlowController extends Control and owns all @onready node references. Screen data is loaded from sample_pvp_flow.json at startup. Buttons wire via signal `.connect()` syntax. A Node.js file-existence test suite verifies all 8 required files exist and the screens array contains all 7 names. validate_data.mjs gained a separate try/catch block for the Godot data file.
- **Why it changed**: To validate the PvP flow in a real game engine. The JS prototype (M10A-M10C) uses 6 screens; the Godot prototype makes planning and battle explicit phases (7 screens). No real combat, networking, or backend calls.
- **Risk**: Low. All new files; no existing code modified except validate_data.mjs (additive) and docs.
- **Tests run**: `npm test` passed with 330 tests (320 prior + 10 new); `npm run validate:data` passed.
- **Known issues**: No real tower firing, creep movement, grid logic, economy, WebSocket, backend API calls, matchmaking, or real combat in the Godot prototype.

## 2026-05-28
- **Task name**: M23 API Match Store Integration
- **Files created**:
  - `backend/api/tests/match_store_route_handlers.test.mjs`
  - `data/samples/backend_api_match_store.valid.sample.json`
  - `data/samples/backend_api_match_store.invalid.sample.json`
- **Files updated**:
  - `backend/api/api_errors.mjs` (MISSING_MATCH_STORE, MATCH_STORE_VALIDATION_FAILED, STORE_MATCH_PROTECTED_ROUTE_FAILED)
  - `backend/api/route_handlers.mjs` (6 new handlers + helpers)
  - `backend/api/route_contracts.mjs` (6 new /store-match/ routes)
  - `backend/api/tests/route_handlers.test.mjs` (route count updated to 21)
  - `backend/api/README.md`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added 6 store-match protected and idempotent route handlers that load match context from an injected `matchStore` via `validateMatchParticipationFromStore`. Client-submitted `server_context.match_context` is explicitly ignored. After participation validates, a second `matchStore.getMatch` call retrieves `allowed_player_ids` for the backend contract's `server_context`. All 6 handler variants are registered in `route_contracts.mjs` under `/store-match/` routes.
- **Why it changed**: To make the protected API pipeline fully store-backed. The matchStore is now the authoritative source for match context, replacing fixture-based `server_context.match_context` fields. Future real database adapters can replace the in-memory store by implementing the match store contract.
- **Risk**: Low. New handlers added without removing existing ones. Fixture-based handler path remains intact. The only breaking change was updating the route count assertion from 15 to 21 in route_handlers.test.mjs.
- **Rollback notes**: Remove the 3 new files, revert 3 error codes from api_errors.mjs, remove the 6 new handlers from route_handlers.mjs, remove 6 routes from route_contracts.mjs, revert route count to 15 in route_handlers.test.mjs, and revert validate_data.mjs.
- **Tests run**: `npm test` passed with 320 tests; `npm run validate:data` passed.
- **Known issues**: No real database match adapter, matchmaking runtime, WebSocket match sync, JWT, login system, production HTTP server, or real combat yet.

## 2026-05-28
- **Task name**: M22 Match Store Contract
- **Files created**:
  - `backend/match_store/README.md`
  - `backend/match_store/match_store_errors.mjs`
  - `backend/match_store/match_store_contract.mjs`
  - `backend/match_store/in_memory_match_store.mjs`
  - `backend/match_store/tests/match_store_contract.test.mjs`
  - `data/samples/match_store.valid.sample.json`
  - `data/samples/match_store.invalid.sample.json`
- **Files updated**:
  - `backend/README.md`
  - `backend/api/README.md`
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added a pure match store contract with an in-memory test double. Three contract functions allow loading match context from an injected store, validating match participation from store, and updating match status in store.
- **Why it changed**: To move protected API handlers toward a replaceable match store boundary instead of relying on `server_context.match_context` fixtures. Future API handlers will inject a real database match adapter.
- **Risk**: Low. New module is pure functions with injected store. No existing handlers were changed. Fixture-based `match_context` path remains intact.
- **Rollback notes**: Remove `backend/match_store/`, the two new sample fixture files, and revert `package.json`, `validate_data.mjs`, and documentation updates.
- **Tests run**: `npm test` passed with 291 tests; `npm run validate:data` passed.
- **Known issues**: No real database match adapter, matchmaking runtime, WebSocket match state sync, distributed concurrency, fraud prevention, or real combat yet.

## 2026-05-28
- **Task name**: M21 API Session Store Integration
- **Files created**:
  - `backend/api/tests/session_store_route_handlers.test.mjs`
  - `data/samples/backend_api_session_store.valid.sample.json`
  - `data/samples/backend_api_session_store.invalid.sample.json`
- **Files updated**:
  - `backend/api/api_errors.mjs`
  - `backend/api/route_handlers.mjs`
  - `backend/api/route_contracts.mjs`
  - `backend/api/tests/route_handlers.test.mjs`
  - `backend/api/README.md`
  - `backend/auth/README.md`
  - `backend/session/README.md`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added store-backed protected, persistent, and idempotent API route handlers that validate sessions through injected `sessionStore` before participation, backend contracts, persistence, and idempotency success saving.
- **Why it changed**: To move new protected API flows toward a replaceable session store boundary without removing existing fixture-based auth tests.
- **Risk**: Low. New handlers are pure functions using injected stores and repositories. Existing fixture-based handlers remain intact.
- **Rollback notes**: Remove store-backed handler exports, route metadata, tests, and API session-store fixtures; then revert API error, validation, and documentation updates.
- **Tests run**: `cmd /c npm test` passed with 276 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real Redis session adapter, DB session adapter, JWT signing/verification, production middleware, session expiry, distributed concurrency, or fraud prevention yet.

## 2026-05-28
- **Task name**: M20 Session Store Contract
- **Files created**:
  - `backend/session/README.md`
  - `backend/session/session_store_errors.mjs`
  - `backend/session/session_store_contract.mjs`
  - `backend/session/in_memory_session_store.mjs`
  - `backend/session/tests/session_store_contract.test.mjs`
  - `data/samples/session_store.valid.sample.json`
  - `data/samples/session_store.invalid.sample.json`
- **Files updated**:
  - `backend/README.md`
  - `backend/auth/README.md`
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added a pure session store contract with deterministic in-memory storage, active-session validation, revocation, player session listing, and mutation-leak protection.
- **Why it changed**: To prepare auth/session validation for injected session stores while keeping the existing `server_context.known_sessions` fixture path compatible.
- **Risk**: Low. The module is pure contract/test code and is not wired into production middleware or a real store.
- **Rollback notes**: Remove `backend/session`, remove session store sample files, and revert documentation, validation, and `package.json` updates.
- **Tests run**: `cmd /c npm test` passed with 254 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real Redis, DB session adapter, JWT/session signing, production middleware, session expiry, distributed concurrency, or fraud prevention yet.

## 2026-05-28
- **Task name**: M19 API Idempotency Integration
- **Files created**:
  - `backend/api/tests/idempotent_route_handlers.test.mjs`
  - `data/samples/backend_api_idempotency.valid.sample.json`
  - `data/samples/backend_api_idempotency.invalid.sample.json`
- **Files updated**:
  - `backend/api/api_errors.mjs`
  - `backend/api/route_handlers.mjs`
  - `backend/api/route_contracts.mjs`
  - `backend/api/tests/route_handlers.test.mjs`
  - `backend/api/README.md`
  - `backend/idempotency/README.md`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added idempotent protected API validate-and-persist handlers for match results and reward claim previews. Replays return stored responses without repeating persistence, while conflicts return 409.
- **Why it changed**: To prevent duplicate match result writes and duplicate reward claim writes during client retries before any production Redis or DB constraint layer exists.
- **Risk**: Low. Handlers remain pure functions using injected repositories and injected idempotency stores.
- **Rollback notes**: Remove idempotent route handlers, metadata, tests, and API idempotency fixtures; then revert API error, validation, and documentation updates.
- **Tests run**: `cmd /c npm test` passed with 238 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real Redis, DB unique constraints, distributed concurrency, production middleware, retry storm handling, fraud prevention, or real combat verification yet.

## 2026-05-28
- **Task name**: M18 Idempotency Contract
- **Files created**:
  - `backend/idempotency/README.md`
  - `backend/idempotency/idempotency_errors.mjs`
  - `backend/idempotency/idempotency_contract.mjs`
  - `backend/idempotency/in_memory_idempotency_store.mjs`
  - `backend/idempotency/tests/idempotency_contract.test.mjs`
  - `data/samples/idempotency.valid.sample.json`
  - `data/samples/idempotency.invalid.sample.json`
- **Files updated**:
  - `backend/README.md`
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added pure idempotency fingerprinting, replay/conflict checks, completed response saving, and an in-memory idempotency store test double.
- **Why it changed**: To prevent duplicate match result persistence and duplicate reward claim persistence in future API retry flows without introducing Redis or database constraints yet.
- **Risk**: Low. The new module is pure and testable with injected storage only.
- **Rollback notes**: Remove `backend/idempotency`, remove idempotency sample files, and revert documentation, validation, and `package.json` updates.
- **Tests run**: `cmd /c npm test` passed with 222 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real Redis, DB unique constraints, distributed concurrency, production HTTP middleware, retry storm handling, fraud prevention, or real combat verification yet.

## 2026-05-28
- **Task name**: M17 Backend API Persistence Integration
- **Files created**:
  - `backend/api/tests/persistent_route_handlers.test.mjs`
  - `data/samples/backend_api_persistence.valid.sample.json`
  - `data/samples/backend_api_persistence.invalid.sample.json`
- **Files updated**:
  - `backend/api/api_errors.mjs`
  - `backend/api/route_handlers.mjs`
  - `backend/api/route_contracts.mjs`
  - `backend/api/tests/route_handlers.test.mjs`
  - `backend/api/README.md`
  - `backend/persistence/README.md`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added protected API handler variants that validate request body, auth/session, match participation, and backend contracts before persisting accepted match results or reward claim previews through injected repositories.
- **Why it changed**: To connect the protected API boundary to the persistence service while keeping persistence replaceable and test-only for now.
- **Risk**: Low. Handlers are pure functions using injected repositories. No real database, auth runtime, HTTP server, WebSocket runtime, matchmaking runtime, combat, or payments were added.
- **Rollback notes**: Remove the two persistence route handlers, route metadata, persistent API tests, and persistence API fixtures; then revert documentation, validation, and API error updates.
- **Tests run**: `cmd /c npm test` passed with 207 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real database adapter, transactions, concurrency handling, idempotency, JWT/session store, production HTTP server, fraud prevention, or real combat verification yet.

## 2026-05-28
- **Task name**: M16 Backend Persistence Design
- **Files created**:
  - `backend/persistence/persistence_errors.mjs`
  - `backend/persistence/repository_contracts.mjs`
  - `backend/persistence/in_memory_repositories.mjs`
  - `backend/persistence/persistence_service.mjs`
  - `backend/persistence/tests/repository_contracts.test.mjs`
  - `backend/persistence/tests/persistence_service.test.mjs`
  - `data/samples/persistence.valid.sample.json`
  - `data/samples/persistence.invalid.sample.json`
- **Files updated**:
  - `backend/persistence/README.md`
  - `backend/README.md`
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
  - `DEV_CHANGELOG.md`
- **What changed**: Added pure repository contract metadata, deterministic in-memory repository test doubles, and persistence service functions for saving validated match results and reward claim previews.
- **Why it changed**: To define replaceable backend persistence ports before introducing any real database adapter.
- **Risk**: Low. The change is pure JavaScript contract/test code with no production database, networking, auth runtime, combat, or payments.
- **Rollback notes**: Remove `backend/persistence` contract/test files and persistence samples, then revert documentation, validation, and `package.json` updates.
- **Tests run**: `cmd /c npm test` passed with 192 tests; `cmd /c npm run validate:data` passed.
- **Known issues**: No real database adapter, migrations, transactions, concurrency controls, idempotency guarantees, fraud prevention, production auth, or real combat verification yet.

## 2026-05-27
- **Task**: Initial project governance setup
- **Files created**:
  - AGENT_CONTEXT.md
  - TODO.md
  - ARCHITECTURE_NOTES.md (placeholder)
  - TEST_REPORT.md (placeholder)
  - docs/ (folder) with initial design docs
- **What changed**: Established project documentation foundation, defined milestones, set coding and fairness guidelines, and outlined architecture.
- **Why**: To provide a clear, shared understanding for all future contributors and agents, and to enforce PvP‑first design principles.
- **Risk**: Low – documentation only, no code execution.
- **Rollback notes**: Delete created markdown files and docs folder if needed.
- **Tests run**: None (documentation only).
- **Known issues**: None.
17: 
18: ## 2026-05-27
19: - **Task**: Complete M1 Project Foundation structure
20: - **Files/folders created**:
21:   - data/, data/schemas/, data/samples/
22:   - tools/, tools/validation/
23:   - scripts/
24:   - backend/unlock/, backend/matchmaking/, backend/room/, backend/draft/, backend/match/, backend/reward/, backend/websocket/, backend/persistence/, backend/tests/
25:   - README.md files for each new folder
26:   - PROJECT_STRUCTURE.md
27: - **What changed**: Added full folder hierarchy, placeholder README documentation, updated tracking docs.
28: - **Why**: To satisfy M1 requirements and provide clear module boundaries before any gameplay code.
29: - **Risk**: Low – only documentation and empty directories.
30: - **Rollback notes**: Delete the created directories and README files.
31: - **Tests run**: Folder‑structure validation script.
32: - **Known issues**: None.
33: 
34: ## 2026-05-28
- **Task**: Fix cosmetic unlock target validation
- **Files changed**:
  - data/samples/unlock_tree.sample.json (target_id updated to fire_tower)
- **What changed**: Cosmetic unlock now references an existing tower item, ensuring unlock target validation passes.
- **Why**: Required to satisfy data validation that all unlock target_ids exist.
- **Tests run**: `npm test` and `npm run validate:data` both passed.
- **Result**: Validation errors resolved, M3 completed.

## 2026-05-28
- **Task**: Complete M5 DraftValidator fixtures and fix test imports
- **Files created**:
  - data/samples/draft.valid.sample.json (3 valid draft fixtures)
  - data/samples/draft.invalid.sample.json (15 invalid draft fixtures)
- **Files changed**:
  - tools/validation/tests/draft_validator.test.mjs (fixed JSON import to use loadJsonFile, fixed catalog_loader import path)
  - tools/validation/src/draft_validator.mjs (slot rule: plain number = max only, min defaults to 0)
  - data/samples/draft_rules.sample.json (tower/creep/spell slots changed to {min, max} objects)
  - tools/validation/validate_data.mjs (added draft fixture existence checks)
  - TEST_REPORT.md (updated with real results)
- **What changed**: Created missing draft fixture files, fixed broken ESM JSON imports, corrected slot rule interpretation per design decision.
- **Why**: DraftValidator tests could not run without fixture files. Node 22 ESM requires loadJsonFile for JSON, not bare import. Slot rules needed {min, max} to enforce both bounds.
- **Risk**: Low – pure validation logic, no gameplay/UI/networking.
- **Tests run**: `npm test` (26 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M6 Local PvP Match Skeleton
- **Files created**:
  - `tools/validation/src/local_match_skeleton.mjs`
  - `tools/validation/tests/local_match_skeleton.test.mjs`
  - `data/samples/local_match.valid.sample.json`
  - `data/samples/local_match.invalid.sample.json`
- **Files updated**:
  - `tools/validation/validate_data.mjs`
  - `tools/validation/README.md`
  - `data/samples/README.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented LocalMatchSkeleton which deterministically wires ArsenalCostValidator -> SharedPoolBuilder -> DraftValidator. Creates ready_to_start match state with verified arsenals, shared pool, and valid final drafts. Removed temporary `debug_test.mjs` test file.
- **Why**: To establish the first deterministic local pre-match flow and prove that valid configurations can generate a safe match state. Removed debug script to keep test suite clean.
- **Risk**: Low – pure validation logic, no gameplay/UI/networking implemented.
- **Rollback notes**: Revert documentation changes and remove the newly created `.mjs` and `.json` files.
- **Tests run**: `npm test` (33 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M7 Local Phase Controller
- **Files created**:
  - `tools/validation/src/local_phase_controller.mjs`
  - `tools/validation/tests/local_phase_controller.test.mjs`
  - `data/samples/local_phase.valid.sample.json`
  - `data/samples/local_phase.invalid.sample.json`
- **Files updated**:
  - `tools/validation/validate_data.mjs`
  - `tools/validation/README.md`
  - `data/samples/README.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented LocalPhaseController to deterministically advance placeholder phases (`ready_to_start` → `planning` → `battle_preview` → `result_preview`). Validates state, action types, and appends transition logs.
- **Why**: To establish a basic state machine for match flow progression without implementing complex combat yet.
- **Risk**: Low – pure state transition logic, no gameplay/UI/networking implemented.
- **Rollback notes**: Revert documentation changes and remove the newly created `.mjs` and `.json` files.
- **Tests run**: `npm test` (45 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M8 Mock Battle Result Preview
- **Files created**:
  - `tools/validation/src/mock_battle_result_preview.mjs`
  - `tools/validation/tests/mock_battle_result_preview.test.mjs`
  - `data/samples/mock_result.valid.sample.json`
  - `data/samples/mock_result.invalid.sample.json`
- **Files updated**:
  - `tools/validation/validate_data.mjs`
  - `tools/validation/README.md`
  - `data/samples/README.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented MockBattleResultPreview to deterministically generate placeholder mock combat results based on core HP. Validates state, calculates result (winner or draw), updates match state and returns a uniform result shape.
- **Why**: To prove the loop structure works and mock out the combat stage before fully integrating a game engine/combat system.
- **Risk**: Low – pure mock validation logic, no gameplay/UI/networking/rewards implemented.
- **Rollback notes**: Revert documentation changes and remove the newly created `.mjs` and `.json` files.
- **Tests run**: `npm test` (56 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M9 Local End-to-End Loop Harness
- **Files created**:
  - `tools/validation/src/local_e2e_loop_harness.mjs`
  - `tools/validation/tests/local_e2e_loop_harness.test.mjs`
  - `data/samples/local_e2e.valid.sample.json`
  - `data/samples/local_e2e.invalid.sample.json`
- **Files updated**:
  - `tools/validation/validate_data.mjs`
  - `tools/validation/README.md`
  - `data/samples/README.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented LocalE2ELoopHarness to seamlessly wire the local_match_skeleton, local_phase_controller, and mock_battle_result_preview sequentially. Proves all logic executes successfully without gameplay logic attached.
- **Why**: Integration step to prove M1-M8 components work identically in sequence as they do in isolation, establishing a deterministic baseline for later prototype integrations.
- **Risk**: Low – simply wires existing validation logic.
- **Rollback notes**: Revert documentation changes and remove the newly created `.mjs` and `.json` files.
- **Tests run**: `npm test` (65 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M10A Client Prototype Foundation
- **Files created**:
  - `client/prototype/README.md`
  - `client/prototype/data/sample_local_e2e_state.json`
  - `client/prototype/src/prototype_state.js`
  - `client/prototype/src/prototype_flow.js`
  - `client/prototype/src/prototype_view_model.js`
  - `client/prototype/tests/prototype_flow.test.mjs`
- **Files updated**:
  - `package.json`
  - `client/README.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented a lightweight JS client prototype foundation. Defines UI state, deterministic screen transitions (`arsenal_preview` -> `shared_pool_preview` -> `draft_preview` -> `phase_flow_preview` -> `result_preview`), and a view model builder to prepare data for UI layers. Updated `npm test` to run these tests.
- **Why**: To establish a client-side architecture that cleanly consumes validated loop data and controls UI flow without duplicating gameplay logic or embedding heavy UI engines immediately.
- **Risk**: Low – pure state transition logic, no rendering or heavy scenes added.
- **Rollback notes**: Revert documentation and `package.json` changes, then remove the `client/prototype` directory.
- **Tests run**: `npm test` (72 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M10C Prototype Scenario Runner
- **Files created**:
  - `client/prototype/data/sample_scenarios.json`
  - `client/prototype/data/generate_scenarios.mjs`
  - `client/prototype/tests/prototype_scenario_runner.test.mjs`
- **Files updated**:
  - `client/prototype/src/prototype_state.js`
  - `client/prototype/src/prototype_view_model.js`
  - `client/prototype/visual/index.html`
  - `client/prototype/visual/styles.css`
  - `client/prototype/visual/app.js`
  - `client/prototype/visual/README.md`
  - `client/prototype/README.md`
  - `client/README.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Added a scenario runner to the visual prototype. Generated rich scenario data based on E2E test cases, updated view models to expose categorized shared pools and side-by-side player loadouts, and implemented a dropdown scenario selector in the UI.
- **Why**: To prove the UI architecture can cleanly handle distinct state variations (e.g. wins, draws, asymmetric unlocks) deterministically using existing validation rules, without injecting game logic into the frontend.
- **Risk**: Low – UI-only extensions.
- **Rollback notes**: Revert documentation and src/visual files, remove the `sample_scenarios.json` and new test.
- **Tests run**: `npm test` (81 pass, 0 fail), `npm run validate:data` (passed).
## 2026-05-28
- **Task**: M11 Reward / Unlock Mock
- **Files created**:
  - `tools/validation/src/reward_unlock_mock.mjs`
  - `tools/validation/tests/reward_unlock_mock.test.mjs`
  - `data/samples/reward_mock.valid.sample.json`
  - `data/samples/reward_mock.invalid.sample.json`
- **Files updated**:
  - `data/schemas/reward_rules.schema.json`
  - `data/samples/reward_rules.sample.json`
  - `tools/validation/src/catalog_loader.mjs`
  - `tools/validation/validate_data.mjs`
  - `tools/validation/README.md`
  - `data/samples/README.md`
  - `docs/UNLOCK_RULES.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented deterministic post-match reward token generation and unlock progress evaluation. Created tests and valid/invalid fixtures. Refactored reward schema to use `win`/`draw`/`participation` block structures. Clarified that no permanent PvP stat advantages are ever granted.
- **Why**: To prove the backend logic framework can safely handle post-match progression completely isolated from combat, relying purely on the mock match result and rules catalog.
- **Risk**: Low – validation and mock algorithms only, no backend networking.
- **Rollback notes**: Revert documentation and src/test files, remove newly created JSON samples and test files.
- **Tests run**: `npm test` (98 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M12 Backend Match / Reward Contract
- **Files created**:
  - `backend/contracts/README.md`
  - `backend/contracts/match_result_contract.mjs`
  - `backend/contracts/reward_claim_contract.mjs`
  - `backend/contracts/backend_contract_errors.mjs`
  - `backend/contracts/tests/match_result_contract.test.mjs`
  - `backend/contracts/tests/reward_claim_contract.test.mjs`
  - `data/samples/backend_contract.valid.sample.json`
  - `data/samples/backend_contract.invalid.sample.json`
- **Files updated**:
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `backend/README.md`
  - `backend/match/README.md`
  - `backend/reward/README.md`
  - `backend/unlock/README.md`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `TEST_REPORT.md`
- **What changed**: Defined backend authoritative contracts for receiving match results and computing reward claims. `match_result_contract` validates submissions and strictly rejects client-provided reward fields. `reward_claim_contract` cleanly delegates to `reward_unlock_mock` for deterministic reward calculation without persisting state.
- **Why**: To establish the necessary strict contract boundaries between the client reporting outcomes and the backend authorizing rewards, before any real database or network runtime is introduced.
- **Risk**: Low – pure DTO validation and functional composition. No runtime server dependencies added.
- **Rollback notes**: Remove the `backend/contracts` folder and the sample data files. Revert documentation and `package.json`.
- **Tests run**: `npm test` (115 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M13B Client Reward Screen Prototype
- **Files created**:
  - `client/prototype/data/sample_reward_preview.json`
  - `client/prototype/tests/prototype_reward_screen.test.mjs`
- **Files updated**:
  - `client/prototype/src/prototype_state.js`
  - `client/prototype/src/prototype_flow.js`
  - `client/prototype/src/prototype_view_model.js`
  - `client/prototype/visual/index.html`
  - `client/prototype/visual/styles.css`
  - `client/prototype/visual/app.js`
  - `client/prototype/visual/README.md`
  - `client/prototype/README.md`
  - `client/README.md`
  - `docs/UNLOCK_RULES.md`
  - `docs/PVP_RULES.md`
  - `ARCHITECTURE_NOTES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `DEV_CHANGELOG.md`
  - `TEST_REPORT.md`
  - `tools/validation/validate_data.mjs`
- **What changed**: Added a visual reward preview screen to the client prototype shell. Extended prototype state, flow, and view model to handle transition from `result_preview` to `reward_preview`. Populated view model with XP, soft currency delta, new unlocks, and critical backend authority warning messages. Added styles for premium sci-fi reward cards. Built comprehensive unit tests proving the flow works deterministically.
- **Why**: To prove the retention loop (match result -> XP/currency -> unlock progress -> visual feedback) works in the client layer while explicitly validating that the client remains a non-authoritative presentation layer for server decisions.
- **Risk**: Low – visual mockup and state management only, no networking, no database.
- **Rollback notes**: Revert `app.js`, `index.html`, `styles.css`, state/flow/view_model files, and remove the new test/sample JSON.
- **Tests run**: `npm test` (126 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M13A Backend API Skeleton
- **Files created**:
  - `backend/api/README.md`
  - `backend/api/api_errors.mjs`
  - `backend/api/route_handlers.mjs`
  - `backend/api/route_contracts.mjs`
  - `backend/api/tests/route_handlers.test.mjs`
  - `data/samples/backend_api.valid.sample.json`
  - `data/samples/backend_api.invalid.sample.json`
- **Files updated**:
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `backend/README.md`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `DEV_CHANGELOG.md`
  - `TEST_REPORT.md`
- **What changed**: Implemented pure, testable route handlers acting as an API skeleton. The handlers wrap `match_result_contract` and `reward_claim_contract` without deeply duplicating logic. Structured error handling was added. Provided robust tests and API sample data.
- **Why**: To establish the API boundary required for the future backend deployment. By mocking the handlers, we define how requests will map to domain logic before investing in an HTTP runtime or authentication middleware.
- **Risk**: Low – validation and handler composition only, no real networking.
- **Rollback notes**: Revert documentation and `package.json` changes, remove `backend/api` folder and the two sample data files.
- **Tests run**: `npm test` (137 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.

## 2026-05-28
- **Task**: M14 Auth / Session Contract
- **Files created**:
  - `backend/auth/README.md`
  - `backend/auth/auth_errors.mjs`
  - `backend/auth/auth_session_contract.mjs`
  - `backend/auth/tests/auth_session_contract.test.mjs`
  - `data/samples/auth_session.valid.sample.json`
  - `data/samples/auth_session.invalid.sample.json`
- **Files updated**:
  - `package.json`
  - `tools/validation/validate_data.mjs`
  - `backend/README.md`
  - `backend/api/README.md`
  - `ARCHITECTURE_NOTES.md`
  - `docs/PVP_RULES.md`
  - `docs/UNLOCK_RULES.md`
  - `TODO.md`
  - `AGENT_CONTEXT.md`
  - `DEV_CHANGELOG.md`
  - `TEST_REPORT.md`
- **What changed**: Created pure, testable auth/session contract validation. `validateRequestSession` checks that a client-claimed session exists in the authoritative server context and that the player_id matches. `validateMatchParticipation` ensures that only valid match participants can submit results or claim rewards. All validation uses stable error codes and follows the existing contract pattern.
- **Why**: To establish the identity and access validation layer before any real login, JWT, or database persistence is introduced. This separates auth concerns from route handler logic.
- **Risk**: Low – pure contract validation only, no real auth runtime or networking.
- **Rollback notes**: Revert documentation and `package.json` changes, remove `backend/auth` folder and the two sample data files.
- **Tests run**: `npm test` (156 pass, 0 fail), `npm run validate:data` (passed).
- **Known issues**: None.
