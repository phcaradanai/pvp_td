# Backend Session Store Contract

## Purpose
`backend/session` defines pure session-store contracts for future auth runtimes. It provides deterministic behavior for saving, reading, revoking, and validating sessions through an injected store.

## Modules
- `session_store_errors.mjs`: Standard session-store error factory.
- `in_memory_session_store.mjs`: Deterministic in-memory test double with cloned input/output.
- `session_store_contract.mjs`: Store-backed helpers for active-session validation and revocation.

## Current Limits
- No Redis.
- No database.
- No login flow.
- No JWT signing or verification.
- No production middleware.

The in-memory store is only a test double. Future auth runtime code can replace it with Redis, a database adapter, or another session backend as long as the injected store preserves this contract.

## API Integration
`backend/api` now includes store-backed protected route variants that call `validateSessionFromStore` through an injected `sessionStore`. The in-memory store remains a deterministic test double only; production Redis or database adapters can replace it later without changing route contracts.
