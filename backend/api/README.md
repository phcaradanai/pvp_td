# Backend API Skeleton

## Purpose
This directory contains the initial API skeleton for the backend. It exposes the authoritative contract logic (`match_result_contract`, `reward_claim_contract`) through testable, isolated route handlers.

## Limitations
- **No real server**: There is no Express/Fastify/HTTP runtime yet. These are pure functions designed to be wrapped by a future web framework.
- **No database persistence**: The handlers do not write to a database. They only validate and compute previews.
- **No authentication**: Security, rate limiting, and session verification are not yet implemented.
- **Purely contractual**: Handlers ensure that the API boundaries do not deep-duplicate validation logic and that client rewards are explicitly rejected.

## Next Steps
In future milestones, this skeleton will be wrapped in a real server runtime with added auth, persistence, rate limiting, and fraud prevention.
