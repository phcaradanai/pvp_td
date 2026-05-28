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
