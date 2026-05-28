# TEST_REPORT.md

## Latest Test Run – 2026-05-28

### npm test

- **Total tests**: 115
- **Pass**: 115
- **Fail**: 0
- **Suites**: 1
- **Duration**: ~460 ms

| # | Test Name | Status |
|---|-----------|--------|
| 1-81 | Previous Arsenal/Draft/Match/Prototype tests | ✅ pass |
| 82-97 | Previous RewardUnlockMock tests | ✅ pass |
| 98 | MatchResultContract - valid draw match result submission passes | ✅ pass |
| 99 | MatchResultContract - valid Player A win match result submission passes | ✅ pass |
| 100 | MatchResultContract - unauthorized submitter fails | ✅ pass |
| 101 | MatchResultContract - match not completed fails | ✅ pass |
| 102 | MatchResultContract - invalid match phase fails | ✅ pass |
| 103 | MatchResultContract - client reward fields are rejected | ✅ pass |
| 104 | MatchResultContract - invalid result preview fails | ✅ pass |
| 105 | MatchResultContract - input is not mutated | ✅ pass |
| 106 | RewardClaimContract - valid draw reward claim preview passes | ✅ pass |
| 107 | RewardClaimContract - reward claim uses reward calculation | ✅ pass |
| 108 | RewardClaimContract - reward claim uses unlock progression | ✅ pass |
| 109 | RewardClaimContract - missing request_id fails | ✅ pass |
| 110 | RewardClaimContract - missing match_result fails | ✅ pass |
| 111 | RewardClaimContract - missing players fails | ✅ pass |
| 112 | RewardClaimContract - input is not mutated | ✅ pass |
| 113 | SharedPoolBuilder - merges two valid arsenals and includes base pool | ✅ pass |
| 114 | SharedPoolBuilder - removes duplicates when rule true | ✅ pass |
| 115 | SharedPoolBuilder - does not mutate original input | ✅ pass |

### npm run validate:data

- **Result**: Data validation passed ✅
- **Checks**:
  - All sample JSON files load correctly
  - No duplicate IDs across catalogs
  - Unlock tree targets exist and grants_stat_advantage is false
  - Reward rules exist and have win/draw/participation configured
  - Arsenal rules contain all required fields
  - Draft fixture files (draft.valid.sample.json, draft.invalid.sample.json) exist
  - Local match fixture files (local_match.valid.sample.json, local_match.invalid.sample.json) exist
  - Local phase fixture files (local_phase.valid.sample.json, local_phase.invalid.sample.json) exist
  - Mock result fixture files (mock_result.valid.sample.json, mock_result.invalid.sample.json) exist
  - Local E2E fixture files (local_e2e.valid.sample.json, local_e2e.invalid.sample.json) exist
  - Reward mock fixture files (reward_mock.valid.sample.json, reward_mock.invalid.sample.json) exist
  - Backend contract fixture files (backend_contract.valid.sample.json, backend_contract.invalid.sample.json) exist
  - Prototype scenario runner data files exist

## Untested Areas
- Real browser automation (Selenium/Playwright)
- Godot scenes
- Real combat
- Tower attacks
- Creep movement
- Economy persistence
- Real HTTP server
- Database persistence
- Authentication
- Fraud prevention
- Real combat verification
- Online networking

*Tests are added alongside code implementations as the project progresses.*
