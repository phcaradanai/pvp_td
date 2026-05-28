# TEST_REPORT.md

## Latest Test Run – 2026-05-28

### npm test

- **Total tests**: 138
- **Pass**: 138
- **Fail**: 0
- **Suites**: 1
- **Duration**: ~925 ms

| # | Test Name | Status |
|---|-----------|--------|
| 1-115 | Previous Arsenal/Draft/Match/Prototype/Contract tests | ✅ pass |
| 116-126 | Prototype Reward Screen tests | ✅ pass |
| 127 | Backend API - health check returns 200 | ✅ pass |
| 128 | Backend API - valid match result validation returns 200 | ✅ pass |
| 129 | Backend API - invalid match result validation returns 400 | ✅ pass |
| 130 | Backend API - unauthorized submitter returns 400 | ✅ pass |
| 131 | Backend API - client-submitted rewards return 400 | ✅ pass |
| 132 | Backend API - missing request body for match result returns 400 | ✅ pass |
| 133 | Backend API - valid reward claim preview returns 200 | ✅ pass |
| 134 | Backend API - invalid reward claim preview returns 400 | ✅ pass |
| 135 | Backend API - missing request body for reward claim returns 400 | ✅ pass |
| 136 | Backend API - route metadata includes all expected routes | ✅ pass |
| 137 | Backend API - handlers do not mutate input | ✅ pass |

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
  - Prototype reward preview sample file exists

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
