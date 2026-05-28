# Backend Persistence Contracts

## Purpose
`backend/persistence` defines pure repository contracts for future database integration. These contracts describe how backend modules will store and load player profiles, sessions, matches, match results, reward claims, and unlock progression snapshots.

## Current Scope
- Repository contract metadata only.
- Deterministic in-memory repositories for tests.
- Persistence service functions that save already validated backend contract outputs.
- API integration uses these persistence service functions through injected repositories after protected route validation succeeds.

## Limitations
- **No real database**: There is no MongoDB, Postgres, MySQL, Redis, file store, or migration layer.
- **In-memory repositories are test doubles**: They are used for deterministic tests only and are not production storage.
- **No production auth/session runtime**: Sessions are stored only as test data in the in-memory repository.
- **No reward calculation**: Persistence saves reward claim previews produced by backend contracts; it does not decide rewards.
- **No permanent PvP stat advantage**: Stored progression previews must preserve the unlock rules and must not grant stat advantages.

## Future Adapter Rule
Future database adapters must preserve the same repository method contracts and cloning/isolation expectations. API/auth/contracts must validate authority and participation before persistence is allowed to save results or reward claim previews.
