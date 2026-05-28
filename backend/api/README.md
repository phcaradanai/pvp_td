# Backend API Skeleton

## Purpose
This directory contains the initial API skeleton for the backend. It exposes the authoritative contract logic (`match_result_contract`, `reward_claim_contract`) through testable, isolated route handlers.

## Limitations
- **No real server**: There is no Express/Fastify/HTTP runtime yet. These are pure functions designed to be wrapped by a future web framework.
- **No real database persistence**: The persistence-enabled handlers use injected repository contracts only. No MongoDB, Postgres, MySQL, Redis, or file database is connected.
- **No authentication**: Security, rate limiting, and session verification are not yet implemented.
- **Purely contractual**: Handlers ensure that the API boundaries do not deep-duplicate validation logic and that client rewards are explicitly rejected.

## API Persistence Integration
The protected validate-and-persist routes compose the existing layers in order:
1. Request body validation.
2. Auth/session validation.
3. Match participation validation.
4. Backend match/reward contract validation.
5. Persistence service save through injected repositories.

Routes:
- `POST /protected/match-results/validate-and-persist`
- `POST /protected/reward-claims/preview-and-persist`

Repositories are injected per call. There is no global mutable repository singleton, and failed validation must not persist match results or reward claim previews.

## API Idempotency Integration
The idempotent protected validate-and-persist routes add an injected idempotency store before persistence:
1. Request body validation.
2. Idempotency check.
3. Auth/session validation.
4. Match participation validation.
5. Backend contract validation.
6. Persistence service save.
7. Save completed idempotency response.

Routes:
- `POST /idempotent/protected/match-results/validate-and-persist`
- `POST /idempotent/protected/reward-claims/preview-and-persist`

Replay with the same `idempotency_key` and same request fingerprint returns the stored response without calling persistence again. Reusing the same key with a different payload returns a conflict. This still uses an injected in-memory idempotency store in tests only; there is no Redis or real database-backed idempotency layer yet.

## API Session Store Integration
Store-backed protected routes validate request sessions through an injected `sessionStore` before match participation, backend contract validation, persistence, or idempotency success saving.

Routes:
- `POST /store/protected/match-results/validate`
- `POST /store/protected/reward-claims/preview`
- `POST /store/protected/match-results/validate-and-persist`
- `POST /store/protected/reward-claims/preview-and-persist`
- `POST /store/idempotent/protected/match-results/validate-and-persist`
- `POST /store/idempotent/protected/reward-claims/preview-and-persist`

The store-backed handlers use `backend/session/session_store_contract.mjs` and reject unknown, mismatched, inactive, or revoked sessions. The existing `server_context.known_sessions` fixture path remains available for older tests and handlers, but injected session stores are the preferred future boundary.

There is still no Redis, database session adapter, JWT verification, login runtime, production middleware, or HTTP server.

## API Match Store Integration (M23)
Store-match protected routes validate match context through an injected `matchStore` before backend contract validation, persistence, or idempotency success saving. Client-submitted `server_context.match_context` is ignored — the match store is the authoritative source.

Pipeline: `request → idempotency check (if applicable) → sessionStore → matchStore → backend contract → persistence → save idempotency result (if applicable)`

Routes:
- `POST /store-match/protected/match-results/validate`
- `POST /store-match/protected/reward-claims/preview`
- `POST /store-match/protected/match-results/validate-and-persist`
- `POST /store-match/protected/reward-claims/preview-and-persist`
- `POST /store-match/idempotent/protected/match-results/validate-and-persist`
- `POST /store-match/idempotent/protected/reward-claims/preview-and-persist`

After `validateMatchParticipationFromStore` confirms the player is in the match, a second `matchStore.getMatch` call retrieves `allowed_player_ids` for the backend contract's `server_context`. The `match_status` and `match_phase` come from `participation_context`.

There is still no real database match adapter, matchmaking runtime, WebSocket sync, JWT, login system, or HTTP server.

## Next Steps
In future milestones, this skeleton will be wrapped in a real server runtime. Additional layers will include rate limiting and fraud prevention.
