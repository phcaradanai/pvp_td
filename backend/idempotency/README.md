# Backend Idempotency Contract

## Purpose
`backend/idempotency` defines pure contracts for handling duplicate backend requests safely. It prevents duplicate match result persistence and duplicate reward claim persistence by associating each `idempotency_key` with a deterministic request fingerprint and completed response.

## Current Scope
- Stable request fingerprint generation.
- Replay detection for the same key and same payload.
- Conflict detection for the same key with a different payload.
- Deterministic in-memory idempotency store for tests.
- API integration uses an injected idempotency store for protected validate-and-persist route variants.

## Limitations
- **No Redis**: There is no distributed cache or production idempotency middleware.
- **No real database constraints**: This milestone does not add unique indexes, transactions, or migrations.
- **No HTTP runtime**: The contract is pure and designed for future API integration.

## Future Store Rule
Future Redis or database-backed stores can replace the in-memory store if they preserve the same `getRecord(key)` and `saveRecord(record)` behavior, clone/isolate stored values, and prevent duplicate rewards under retry or replay conditions.
