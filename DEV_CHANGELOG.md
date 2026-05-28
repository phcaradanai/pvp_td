# DEV_CHANGELOG.md

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
