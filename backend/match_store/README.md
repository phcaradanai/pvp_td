# backend/match_store

## Purpose

Defines a replaceable match store contract for loading and updating match context in future protected API handlers. This module replaces `server_context.match_context` fixtures with an injected, testable match store.

## What is here

- `match_store_errors.mjs` — Error factory for stable match store error codes.
- `in_memory_match_store.mjs` — In-memory match store test double. Used in contract tests and future API handler tests.
- `match_store_contract.mjs` — Pure contract functions for validating match context and participation from an injected store.
- `tests/match_store_contract.test.mjs` — Contract and store tests using Node's built-in test runner.

## Contract functions

### `validateMatchFromStore(input, matchStore)`
Loads a match from the injected store and returns a `match_context` object. Fails if the match is unknown.

### `validateMatchParticipationFromStore(input, matchStore)`
Loads a match from the store and validates that the requesting player is a valid participant. Returns a `participation_context` object.

### `updateMatchStatusInStore(input, matchStore)`
Validates and updates a match's status in the store. Returns the updated match.

## In-memory store

`createInMemoryMatchStore(seed)` creates a fresh, isolated store seeded with optional initial matches. All input and output is cloned to prevent mutation leaks. There is no global singleton.

Store methods:
- `getMatch(match_id)` — returns cloned match or null
- `saveMatch(match)` — validates and stores a cloned match
- `updateMatchStatus(match_id, status)` — validates status, fails if match unknown
- `saveMatchResult(match_id, result)` — stores cloned result on the match
- `listMatchesByPlayer(player_id)` — returns cloned matches, ordered by match_id

## What is NOT here

- No real database adapter (no MongoDB, Postgres, Redis, SQLite, etc.)
- No matchmaking runtime
- No WebSocket match state synchronization
- No production HTTP server
- No real combat

The in-memory store is a deterministic test double only. A future database adapter can replace it by implementing the same five store methods.

## Future flow

```
request → idempotency → sessionStore → matchStore → contract → persistence
```
