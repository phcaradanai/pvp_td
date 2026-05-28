# TEST_REPORT.md

## Latest Test Run – 2026-05-28

### npm test

- **Total tests**: 56
- **Pass**: 56
- **Fail**: 0
- **Suites**: 1 (ArsenalCostValidator)
- **Duration**: ~436 ms

| # | Test Name | Status |
|---|-----------|--------|
| 1 | ArsenalCostValidator › valid arsenal passes | ✅ pass |
| 2 | ArsenalCostValidator › invalid arsenal fails with appropriate errors | ✅ pass |
| 3 | DraftValidator - valid basic draft | ✅ pass |
| 4 | DraftValidator - valid with optional relic | ✅ pass |
| 5 | DraftValidator - valid with optional guardian | ✅ pass |
| 6 | DraftValidator - input immutability | ✅ pass |
| 7 | DraftValidator - pick outside shared pool | ✅ pass |
| 8 | DraftValidator - unknown item id | ✅ pass |
| 9 | DraftValidator - disabled item | ✅ pass |
| 10 | DraftValidator - duplicate pick | ✅ pass |
| 11 | DraftValidator - too few towers | ✅ pass |
| 12 | DraftValidator - too many towers | ✅ pass |
| 13 | DraftValidator - too few creeps | ✅ pass |
| 14 | DraftValidator - too many creeps | ✅ pass |
| 15 | DraftValidator - too few spells | ✅ pass |
| 16 | DraftValidator - too many spells | ✅ pass |
| 17 | DraftValidator - too many relics | ✅ pass |
| 18 | DraftValidator - too many guardians | ✅ pass |
| 19 | DraftValidator - invalid category | ✅ pass |
| 20 | DraftValidator - missing shared pool | ✅ pass |
| 21 | DraftValidator - missing final loadout | ✅ pass |
| 22 | LocalMatchSkeleton - valid basic local match | ✅ pass |
| 23 | LocalMatchSkeleton - asymmetric unlock local match | ✅ pass |
| 24 | LocalMatchSkeleton - missing match id | ✅ pass |
| 25 | LocalMatchSkeleton - invalid player a arsenal | ✅ pass |
| 26 | LocalMatchSkeleton - invalid player b arsenal | ✅ pass |
| 27 | LocalMatchSkeleton - invalid player a draft | ✅ pass |
| 28 | LocalMatchSkeleton - invalid player b draft | ✅ pass |
| 29 | LocalPhaseController - ready_to_start can advance to planning | ✅ pass |
| 30 | LocalPhaseController - planning can advance to battle_preview | ✅ pass |
| 31 | LocalPhaseController - battle_preview can advance to result_preview | ✅ pass |
| 32 | LocalPhaseController - result_preview can reset to ready_to_start | ✅ pass |
| 33 | LocalPhaseController - full placeholder cycle works | ✅ pass |
| 34 | LocalPhaseController - missing match_state fails | ✅ pass |
| 35 | LocalPhaseController - missing action fails | ✅ pass |
| 36 | LocalPhaseController - invalid action type fails | ✅ pass |
| 37 | LocalPhaseController - invalid phase fails | ✅ pass |
| 38 | LocalPhaseController - ready_to_start cannot go directly to battle_preview | ✅ pass |
| 39 | LocalPhaseController - planning cannot go directly to result_preview | ✅ pass |
| 40 | LocalPhaseController - result_preview cannot go back to battle_preview | ✅ pass |
| 41 | MockBattleResultPreview - equal core HP returns draw | ✅ pass |
| 42 | MockBattleResultPreview - higher Player A core HP returns Player A winner | ✅ pass |
| 43 | MockBattleResultPreview - higher Player B core HP returns Player B winner | ✅ pass |
| 44 | MockBattleResultPreview - missing match_state fails | ✅ pass |
| 45 | MockBattleResultPreview - ready_to_start phase fails | ✅ pass |
| 46 | MockBattleResultPreview - planning phase fails | ✅ pass |
| 47 | MockBattleResultPreview - battle_preview phase fails | ✅ pass |
| 48 | MockBattleResultPreview - missing players fails | ✅ pass |
| 49 | MockBattleResultPreview - missing core_hp fails | ✅ pass |
| 50 | MockBattleResultPreview - invalid core_hp fails | ✅ pass |
| 51 | MockBattleResultPreview - already generated result fails | ✅ pass |
| 52 | SharedPoolBuilder merges two valid arsenals and includes base pool | ✅ pass |
| 53 | SharedPoolBuilder removes duplicates when rule true | ✅ pass |
| 54 | SharedPoolBuilder does not mutate original input | ✅ pass |
| 55 | Invalid Player A arsenal fails | ✅ pass |
| 56 | Invalid Player B arsenal fails | ✅ pass |

### npm run validate:data

- **Result**: Data validation passed ✅
- **Checks**:
  - All sample JSON files load correctly
  - No duplicate IDs across catalogs
  - Unlock tree targets exist and grants_stat_advantage is false
  - Arsenal rules contain all required fields
  - Draft fixture files (draft.valid.sample.json, draft.invalid.sample.json) exist
  - Local match fixture files (local_match.valid.sample.json, local_match.invalid.sample.json) exist
  - Local phase fixture files (local_phase.valid.sample.json, local_phase.invalid.sample.json) exist
  - Mock result fixture files (mock_result.valid.sample.json, mock_result.invalid.sample.json) exist

## Untested Areas
- Real combat
- Tower attacks
- Creep movement
- Economy
- Rewards
- Network communication (WebSocket messaging)
- UI interactions (no UI code yet)
- Performance budget compliance
- Backend match logic

*Tests are added alongside code implementations as the project progresses.*
