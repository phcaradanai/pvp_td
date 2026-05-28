# TODO.md

## Milestones

- [x] **M0 – Project Governance**
  - [ ] Define project vision and design pillars
  - [ ] Establish coding standards and file size limits
  - [ ] Create initial documentation set (AGENT_CONTEXT, ARCHITECTURE_NOTES, etc.)
  - [ ] Set up project repository structure
  - [ ] Draft initial changelog and test report

12: - [x] **M1 – Project Foundation**
  - [x] client folder with all sub-modules
  - [x] backend folder with all sub-modules
  - [x] data folder with schemas and samples
  - [x] tools folder with README and validation
  - [x] scripts folder with README

- [ ] **M2 – Data‑Driven Core**
  - Implement core data loading system
  - Define JSON schemas for towers, creeps, spells, etc.
  - Unit tests for data validation

- [x] **M3 – Arsenal Cost Limit**
  - Design cost‑limit algorithm
  - Integrate with draft system

- [x] **M4 – Shared Pool System**
  - [x] Implement pool merging logic
  - [x] Ensure fairness constraints

- [x] **M5 – Draft Phase**
  - [x] Implement turn‑based draft UI (placeholder)
  - [x] Draft validation rules

- [x] **M6 – Local PvP Match Skeleton**
  - [x] Local match skeleton implemented
  - [x] Validator chain wired
  - [x] Ready-to-start state created
  - [x] Unit tests added

- [x] **M7 – Local Phase Controller**
  - [x] LocalPhaseController implemented
  - [x] Placeholder phase transitions validated
  - [x] Invalid transitions rejected
  - [x] Unit tests added

- [x] **M8 – Mock Battle Result Preview**
  - [x] Mock result preview implemented
  - [x] Draw result supported
  - [x] Player A/B winner by core HP supported
  - [x] Duplicate result generation rejected
  - [x] Unit tests added

- [x] **M9 – Local End-to-End Loop Harness**
  - [x] E2E harness implemented
  - [x] Validator/phase/mock result modules wired
  - [x] Trace output added
  - [x] Unit/integration tests added

- [x] **M10A – Client Prototype Foundation**
  - [x] Lightweight UI prototype state created
  - [x] Prototype flow controller created
  - [x] View model builder created

- [x] **M10B – Client Visual Prototype Shell**
  - [x] HTML/CSS/JS view model bindings

- [x] **M10C – Prototype Scenario Runner**
  - [x] Scenario selection and expanded views

- [x] **M11 – Reward / Unlock Mock**
  - [x] Deterministic mock rewards
  - [x] Unlock progression calculation
  - [x] No permanent PvP stat advantage rule enforced

- [x] **M12 – Backend Match / Reward Contract**
  - [x] Match result submission validation
  - [x] Reward claim backend contract
  - [x] Client reward calculation rejected

- [x] **M13B – Client Reward Screen Prototype**
  - [x] Add reward_preview to state and flow
  - [x] Map rewards and unlocks to view model
  - [x] Visualize reward cards and unlock chips

- [x] **M13A – Backend API Skeleton**
  - [x] Create API skeleton and error handling
  - [x] Implement testable route handlers for match results and reward claims
  - [x] Write backend API tests

- [x] **M14 – Auth / Session Contract**
  - [x] Create auth_errors.mjs
  - [x] Implement validateRequestSession
  - [x] Implement validateMatchParticipation
  - [x] Write auth contract tests

- [x] **M15 - Backend API Auth Integration**
  - [x] Protected API handlers validate session before contracts
  - [x] Protected API handlers validate match participation before contracts
  - [x] Auth-aware API samples and tests added

- [x] **M16 - Backend Persistence Design**
  - [x] Repository contract metadata
  - [x] In-memory repository test doubles
  - [x] Persistence service for validated match results
  - [x] Persistence service for reward claim previews
  - [x] Tests pass

- [x] **M17 - Backend API Persistence Integration**
  - [x] Protected validate-and-persist match result handler
  - [x] Protected reward claim preview-and-persist handler
  - [x] Persistence route metadata
  - [x] No persistence on failed auth/session, participation, or contract validation
  - [x] Tests pass

- [x] **M18 - Idempotency Contract**
  - [x] Stable request fingerprinting
  - [x] In-memory idempotency store test double
  - [x] Replay returns stored response
  - [x] Conflicting key reuse fails
  - [x] Tests pass

- [x] **M19 - API Idempotency Integration**
  - [x] Idempotent protected match result validate-and-persist handler
  - [x] Idempotent protected reward claim preview-and-persist handler
  - [x] Replay returns stored response without repeat persistence
  - [x] Conflict returns failure without persistence
  - [x] Tests pass

- [x] **M20 - Session Store Contract**
  - [x] Pure session store contract helpers
  - [x] In-memory session store test double
  - [x] Active session validation through injected store
  - [x] Session revocation and future validation failure
  - [x] Tests pass

- [x] **M21 - API Session Store Integration**
  - [x] Store-backed protected match result and reward claim handlers
  - [x] Store-backed protected persistence handlers
  - [x] Store-backed idempotent persistence handlers
  - [x] Failed session validation prevents persistence and idempotency success saves
  - [x] Tests pass

- [x] **M22 - Match Store Contract**
  - [x] Pure match store contract helpers
  - [x] In-memory match store test double
  - [x] Match context validation through injected store
  - [x] Match participation validation through injected store
  - [x] Match status update through injected store
  - [x] Clone prevents mutation leaks
  - [x] Tests pass

- [x] **M23 - API Match Store Integration**
  - [x] Store-match protected match result validate handler
  - [x] Store-match protected reward claim preview handler
  - [x] Store-match protected validate-and-persist match result handler
  - [x] Store-match protected reward claim preview-and-persist handler
  - [x] Store-match idempotent protected validate-and-persist match result handler
  - [x] Store-match idempotent protected reward claim preview-and-persist handler
  - [x] Client-submitted server_context ignored; matchStore is authoritative
  - [x] Route metadata includes store-match routes
  - [x] Tests pass

- [x] **M24 - Godot Scene Prototype**
  - [x] `godot_prototype/data/sample_pvp_flow.json` — 7-screen data with screen_data per phase
  - [x] `godot_prototype/scripts/pvp_flow_state.gd` — PvpFlowState (RefCounted), JSON load, navigation
  - [x] `godot_prototype/scripts/pvp_flow_view_model.gd` — PvpFlowViewModel (RefCounted), static build()
  - [x] `godot_prototype/scripts/pvp_flow_controller.gd` — extends Control, wires signals, calls _render()
  - [x] `godot_prototype/scenes/pvp_flow_prototype.tscn` — Godot 4 scene format=3
  - [x] `godot_prototype/project.godot` — config_version=5, no icon reference
  - [x] `godot_prototype/README.md` and `godot_prototype/tests/README.md`
  - [x] `tools/validation/tests/godot_prototype_structure.test.mjs` — 10 file-existence + screens subtests
  - [x] validate_data.mjs updated with separate Godot data check block
  - [x] 330 tests pass, validate:data passes

- [x] **M25 - Godot Draft Interaction Prototype**
  - [x] `godot_prototype/data/sample_pvp_flow.json` — added `shared_pool` key with 6 pool items; updated draft/planning/battle screen_data for dynamic content
  - [x] `godot_prototype/scripts/pvp_flow_state.gd` — added pool_items, budget_max, draft_picks_a/b, current_drafter, draft_locked; pick_shared_pool_item(), lock_draft(), reset_draft(), can_advance_from_current_screen(); go_next/reset updated
  - [x] `godot_prototype/scripts/pvp_flow_view_model.gd` — build(state, feedback); show_pool_items, pool_item_cards, lock_draft_enabled; _build_draft_panels, _build_planning_panels, _build_battle_panels
  - [x] `godot_prototype/scripts/pvp_flow_controller.gd` — pick_shared_pool_item(), lock_draft(), reset_draft(), can_advance_from_current_screen(), _rebuild_pool_buttons() with .bind(); LockDraftButton wired
  - [x] `godot_prototype/scenes/pvp_flow_prototype.tscn` — LockDraftButton added to Controls; PoolScrollContainer + PoolItemsContainer added to CenterPanel/VBox
  - [x] `tools/validation/tests/godot_draft_interaction_structure.test.mjs` — 36 content-grep + JSON structure tests
  - [x] 366 tests pass, validate:data passes

## Next Possible Steps
The pure data contracts, API skeleton, auth/session contracts, persistence contracts, protected API persistence integration, idempotency contracts, API idempotency integration, session store contract, API session store integration, match store contract, API match store integration, Godot scene prototype, and Godot interactive draft prototype are built.

- **M25 Real Combat Prototype**: Begin building actual tower/creep gameplay in Godot.
- **M25B Real DB Adapter Design**: Design production database adapters without implementing them.
- **M25C WebSocket Skeleton**: Design the real-time match state sync layer.

- [ ] **Fun Validation**
  - Playtesting framework
  - Balance tweaking workflow

- [ ] **M8 – Reward + Unlock Mock**
  - Mock reward distribution
  - Unlock progression prototype

- [ ] **M9 – Beauty Vertical Slice**
  - 2.5D visual assets integration
  - Polish UI/UX for demo

- [ ] **M10 – Backend PvP Foundation**
  - Server authoritative match logic
  - WebSocket communication layer

- [ ] **M11 – Online Private Match**
  - Lobby system for friends
  - Matchmaking stub

- [ ] **M12 – Closed Alpha**
  - Internal testing build
  - Feedback loop

- [ ] **M13 – Ranked MVP**
  - Ranked ladder implementation
  - ELO/seasonal reset

- [ ] **M14 – Production Polish**
  - Performance optimization
  - Final QA and release prep
