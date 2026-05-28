# Backend Auth / Session Contract

## Purpose
This directory contains pure, testable auth/session validation contracts for future API protection. The contracts define how requests must identify themselves via `session_id`, `player_id`, and how the backend server validates these claims against an authoritative `server_context`.

## Modules
- `auth_errors.mjs`: Standard error shape factory for auth contract errors.
- `auth_session_contract.mjs`: Two pure contract functions:
  - `validateRequestSession(input)` — validates a request carries a valid, active session recognized by the server.
  - `validateMatchParticipation(input)` — validates an authenticated session is a legitimate participant in a given match.

## Limitations
- **No real login**: There is no OAuth, JWT, or password-based authentication yet.
- **No token signing/verification**: Session IDs are compared against a placeholder `server_context.known_sessions` map.
- **No database**: The `server_context` is a fixture. In production, it will be replaced by a real session store or cache lookup.
- **No middleware**: These are pure functions. Future API middleware will call these contracts before allowing route handlers to execute.

## Future Steps
- Use `backend/session` as the pure session store contract companion to `server_context.known_sessions`. The current fixture path remains compatible until API handlers are explicitly integrated with the injected session store.
- Store-backed API handlers now prefer injected session store validation for new protected routes, while fixture-based validation remains for existing contract tests.
- Replace `server_context.known_sessions` with a real session store adapter later.
- Add JWT or signed session token verification.
- Wire into API route middleware so all requests must pass auth before reaching route handlers.
