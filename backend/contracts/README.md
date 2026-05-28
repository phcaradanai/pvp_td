# Backend Contracts

This directory defines the authoritative contracts between the client and the server for critical match and reward operations.

## Purpose
- **Server Authority**: The backend is the ultimate source of truth. The client may preview results, but the backend recomputes or validates them.
- **Match Result Submission**: Validates that match results submitted by the client conform to expected shapes and security constraints (e.g. `submitted_by` is valid, match is in `result_preview` phase).
- **Reward Claim**: Recomputes rewards deterministically on the backend to prevent spoofed client reward claims.

## Constraints
- **No Real Server / Database**: There is no actual HTTP API, WebSocket server, or database persistence implemented yet. These contracts serve as pure function specifications for future implementation.
- **No Client Authority on Rewards**: The `match_result_contract` explicitly rejects any reward tokens included in a client's submission.
- **Production Independence**: In production, the server must recompute and verify all match outcomes and reward payouts.
