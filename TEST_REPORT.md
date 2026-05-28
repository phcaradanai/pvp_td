# TEST_REPORT.md

## Latest Test Run - 2026-05-28 M25 Godot Draft Interaction Prototype (Dead-end Fix)

### npm test

- **Command**: `npm test`
- **Total tests**: 388
- **Pass**: 388
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `npm run validate:data`
- **Result**: Data validation passed

### Godot Draft Viability Structure Tests Added (22 tests)
- pvp_flow_state.gd contains can_pick_item_without_breaking_draft, is_draft_deadlocked, get_player_requirement_status, get_remaining_available_items, is_draft_completable_after_pick, _picks_status.
- pick_shared_pool_item calls viability guard before mutating state.
- is_draft_deadlocked checks can_pick_item_without_breaking_draft for each candidate.
- pvp_flow_view_model.gd contains draft_status_text field, viable in pool_item_cards, _build_draft_status_text, _missing_requirements_text, _req_status_text.
- View model deadlock message contains "Reset draft".
- View model calls get_player_requirement_status and is_draft_deadlocked.
- pvp_flow_controller.gd contains _draft_status_label and binds vm.draft_status_text.
- Controller shows ⚠ indicator for non-viable affordable items; disables only drafted/unaffordable.
- pvp_flow_prototype.tscn contains DraftStatusLabel as child of MainLayout/Controls.

### Godot Draft Interaction Structure Tests Added (36 tests)
- pvp_flow_controller.gd contains pick_shared_pool_item, lock_draft, reset_draft, can_advance_from_current_screen, LockDraftButton, _rebuild_pool_buttons.
- pvp_flow_controller.gd uses `.bind(item_id)` for pool item signal connections (not lambda).
- pvp_flow_state.gd contains draft_locked, current_drafter, draft_picks_a, draft_picks_b, pick_shared_pool_item, lock_draft, reset_draft, can_advance_from_current_screen, budget_max, budget_used_for, budget_remaining_for.
- pvp_flow_view_model.gd contains pool_item_cards, show_pool_items, lock_draft_enabled, feedback parameter, _build_draft_panels, _build_planning_panels, _build_battle_panels.
- sample_pvp_flow.json has shared_pool key with budget_max=10 and 6 items.
- All 6 required item ids present: archer, cannon, scout, mage, tank, fireball.
- All items have id, name, category, cost fields.
- Screens array still has 7 screens (existing test still passes).

### Untested Areas
- Godot 4 editor runtime (requires Godot 4.6.2 installed — manual test only)
- Real tower firing, creep movement, grid logic
- WebSocket, backend API calls, matchmaking
- Real combat
- Real DB match adapter
- JWT / login system
- Production HTTP server

## Latest Test Run - 2026-05-28 M24 Godot Scene Prototype

### npm test

- **Command**: `npm test`
- **Total tests**: 330
- **Pass**: 330
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `npm run validate:data`
- **Result**: Data validation passed

### Godot Prototype Structure Tests Added
- All 8 required godot_prototype files exist (project.godot, README.md, tscn, 3 gd scripts, sample_pvp_flow.json, tests/README.md).
- `sample_pvp_flow.json` screens array contains exactly 7 required screen names.
- Screens are in correct order: arsenal_preview, shared_pool_preview, draft_preview, planning_preview, battle_preview, result_preview, reward_preview.
- validate_data.mjs Godot check block passes (file exists, parses as JSON, all 7 screens present).

### Untested Areas
- Godot 4 editor runtime (requires Godot 4.6.2 installed — manual test only)
- Real tower firing, creep movement, grid logic
- WebSocket, backend API calls, matchmaking
- Real combat
- Real DB match adapter
- JWT / login system
- Production HTTP server

## Latest Test Run - 2026-05-28 M23 API Match Store Integration

### npm test

- **Command**: `npm test`
- **Total tests**: 320
- **Pass**: 320
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `npm run validate:data`
- **Result**: Data validation passed

### Match-Store API Route Handler Tests Added
- Valid store-match protected match result and reward claim routes return `200`.
- Store-match persistence routes save validated match results and reward claims.
- Store-match idempotent persistence routes return `mode: "new"` and replay without repeated persistence writes.
- Missing matchStore returns `400` with `MISSING_MATCH_STORE`.
- Missing sessionStore returns `400` with `MISSING_SESSION_STORE`.
- Unknown session returns `400` with `SESSION_STORE_VALIDATION_FAILED`.
- Unknown match (not in store) returns `400` with `MATCH_STORE_VALIDATION_FAILED`.
- Player not in match fails with `PLAYER_NOT_IN_MATCH` detail in `MATCH_STORE_VALIDATION_FAILED`.
- Invalid match phase returns `400` with contract-level `INVALID_MATCH_PHASE` directly in errors (not wrapped in match store error).
- Client-submitted rewards return `400` with `CLIENT_REWARD_NOT_ALLOWED`.
- Idempotency conflicts return `409`.
- Failed match store validation does not persist or save idempotency success.
- Client-submitted `server_context` with misleading match context is ignored; match store is authoritative.
- Route metadata updated to 21 routes including all 6 `/store-match/` routes.
- Handlers do not mutate input and match store cloning prevents mutation leaks.

### Untested Areas
- Real DB match adapter
- Matchmaking runtime
- WebSocket match state sync
- Distributed concurrency
- Fraud prevention
- Real combat verification

## Latest Test Run - 2026-05-28 M22 Match Store Contract

### npm test

- **Command**: `npm test`
- **Total tests**: 297
- **Pass**: 297
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `npm run validate:data`
- **Result**: Data validation passed

### Match Store Contract Tests Added
- In-memory store saves and gets match.
- Missing match returns null.
- `listMatchesByPlayer` returns deterministic order by `match_id`.
- Store cloning prevents mutation leaks.
- `saveMatchResult` stores cloned result on the match.
- Valid match from store passes `validateMatchFromStore`.
- Unknown match fails with `UNKNOWN_MATCH`.
- Valid match participation from store passes `validateMatchParticipationFromStore`.
- Player not in match fails with `PLAYER_NOT_IN_MATCH`.
- Invalid match status fails with `INVALID_MATCH_STATUS`.
- Update match status succeeds via `updateMatchStatusInStore`.
- Update unknown match fails with `UPDATE_MATCH_STATUS_FAILED`.
- All three contract functions do not mutate input.

### Untested Areas
- Real DB match adapter
- Matchmaking runtime
- WebSocket match state sync
- Distributed concurrency
- Fraud prevention
- Real combat verification

## Latest Test Run - 2026-05-28 M21 API Session Store Integration

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 276
- **Pass**: 276
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Session-Store API Route Handler Tests Added
- Valid store-backed protected match result and reward claim routes return `200`.
- Store-backed persistence routes save validated match results and reward claims.
- Store-backed idempotent persistence routes return `mode: "new"` and replay without repeated persistence writes.
- Missing, unknown, mismatched, inactive, and revoked sessions return `400`.
- Player participation and client-submitted reward failures return `400`.
- Idempotency conflicts return `409`.
- Failed session validation does not persist or save idempotency success.
- Store-backed route metadata exists.
- Handlers do not mutate input and session store cloning prevents mutation leaks.

### Untested Areas
- Real Redis session adapter
- Real DB session adapter
- JWT signing/verification
- Production middleware
- Session expiry
- Distributed concurrency
- Fraud prevention

## Latest Test Run - 2026-05-28 M20 Session Store Contract

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 254
- **Pass**: 254
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Session Store Contract Tests Added
- In-memory store saves, reads, revokes, and lists sessions.
- Missing sessions return `null`.
- Player session listing is deterministic by `session_id`.
- Store cloning prevents mutation leaks.
- Store-backed active-session validation passes for active sessions.
- Unknown, mismatched, inactive, and revoked sessions fail with stable error codes.
- Revoked sessions fail future validation.
- Validation and revocation helpers do not mutate input.

### Untested Areas
- Real Redis
- Real DB session adapter
- JWT/session signing
- Production middleware
- Session expiry
- Distributed concurrency
- Fraud prevention

## Latest Test Run - 2026-05-28 M19 API Idempotency Integration

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 238
- **Pass**: 238
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Idempotent API Route Handler Tests Added
- Valid idempotent match result persists and returns `mode: "new"`.
- Replay match result returns the stored response without another persistence write.
- Valid idempotent reward claim persists and returns `mode: "new"`.
- Replay reward claim returns the stored response without another persistence write.
- Same key with different match result or reward claim payload returns `409`.
- Missing idempotency key/store returns `400`.
- Auth, contract, persistence, and client-submitted reward failures do not save idempotency success.
- Route metadata includes idempotent routes.
- Handlers do not mutate input.
- Replay response cloning prevents mutation leaks.

### Untested Areas
- Real Redis
- DB unique constraints
- Distributed concurrency
- Production middleware
- Retry storms
- Fraud prevention
- Real combat verification


## Latest Test Run - 2026-05-28 M18 Idempotency Contract

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 222
- **Pass**: 222
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Idempotency Contract Tests Added
- Stable request fingerprints are independent of object key order.
- Changed payloads produce different fingerprints.
- New requests return `mode: "new"`.
- Replays with the same key and fingerprint return the stored response.
- Same key with a different payload fails with `IDEMPOTENCY_CONFLICT`.
- Completed responses are saved in the in-memory idempotency store.
- Store cloning prevents mutation leaks.
- Idempotency contract functions do not mutate inputs.
- Missing key, payload, fingerprint, response, and invalid store cases fail with stable error codes.

### Untested Areas
- Real Redis
- Real DB unique constraints
- Distributed concurrency
- Production HTTP middleware
- Retry storm handling
- Fraud prevention
- Real combat verification


## Latest Test Run - 2026-05-28 M17 Backend API Persistence Integration

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 207
- **Pass**: 207
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Persistent API Route Handler Tests Added
- Valid protected match result persists and returns `200`.
- Valid protected reward claim preview persists and returns `200`.
- Persisted match results and reward claims can be read from injected repositories.
- Missing repositories and missing match records fail.
- Auth/session, participation, match contract, and reward contract failures do not persist.
- Client-submitted rewards still fail and do not persist.
- Persistent route metadata exists.
- Persistent handlers do not mutate input.
- API responses do not leak mutable repository references.

### Untested Areas
- Real database adapter
- Transactions
- Concurrency
- Idempotency
- Real JWT/session store
- Production HTTP server
- Fraud prevention
- Real combat verification


## Latest Test Run - 2026-05-28 M16 Backend Persistence Design

### npm test

- **Command**: `cmd /c npm test`
- **Total tests**: 192
- **Pass**: 192
- **Fail**: 0
- **Suites**: 1
- **Result**: Passed

### npm run validate:data

- **Command**: `cmd /c npm run validate:data`
- **Result**: Data validation passed

### Persistence Contract Tests Added
- Repository contract metadata exists.
- Profile/session/match/reward claim repository methods are declared.
- In-memory repositories save/get profiles, sessions, matches, match results, and reward claims.
- `saveValidatedMatchResult` saves accepted backend contract results and rejects missing `match_id`.
- `saveRewardClaimPreview` saves reward claim previews without applying profile updates.
- Missing input and missing repository cases return stable persistence error codes.
- Clone behavior prevents mutation leaks and services do not mutate inputs.

### Untested Areas
- Real database adapter
- Migrations
- Transactions
- Concurrency
- Idempotency
- Fraud prevention
- Production auth
- Real combat verification


## Latest Test Run – 2026-05-28

### npm test

- **Total tests**: 156
- **Pass**: 156
- **Fail**: 0
- **Suites**: 1
- **Duration**: ~685 ms

| # | Test Name | Status |
|---|-----------|--------|
| 1-126 | Previous Arsenal/Draft/Match/Prototype/Contract/API tests | ✅ pass |
| 127 | Backend API - health check returns 200 | ✅ pass |
| 128-137 | Backend API - route handler tests | ✅ pass |
| 138 | Auth - valid active session passes | ✅ pass |
| 139 | Auth - unknown session fails | ✅ pass |
| 140 | Auth - session player mismatch fails | ✅ pass |
| 141 | Auth - inactive session fails | ✅ pass |
| 142 | Auth - missing request_id fails | ✅ pass |
| 143 | Auth - missing session fails | ✅ pass |
| 144 | Auth - missing server_context fails | ✅ pass |
| 145 | Auth - missing session_id fails | ✅ pass |
| 146 | Auth - missing player_id fails | ✅ pass |
| 147 | Auth - valid match participation completed passes | ✅ pass |
| 148 | Auth - valid match participation active passes | ✅ pass |
| 149 | Auth - player not in match fails | ✅ pass |
| 150 | Auth - invalid match status fails | ✅ pass |
| 151 | Auth - missing match_context fails | ✅ pass |
| 152 | Auth - missing match_id fails | ✅ pass |
| 153 | Auth - validateRequestSession does not mutate input | ✅ pass |
| 154 | Auth - validateMatchParticipation does not mutate input | ✅ pass |

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
  - Backend API fixture files (backend_api.valid.sample.json, backend_api.invalid.sample.json) exist
  - Auth session fixture files (auth_session.valid.sample.json, auth_session.invalid.sample.json) exist
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
- Real login (OAuth, JWT signing/verification)
- Database session store
- API middleware integration
- Production authorization policy
- Rate limiting
- Fraud prevention
- Real combat verification
- Online networking

*Tests are added alongside code implementations as the project progresses.*
