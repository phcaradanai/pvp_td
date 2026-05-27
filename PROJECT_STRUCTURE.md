# PROJECT_STRUCTURE.md

## Full folder layout
```
project_root/   (pvp_td)
├─ client/                     # Player‑side code, UI, non‑authoritative logic
│   ├─ core/
│   ├─ data/
│   ├─ match/
│   ├─ arsenal/
│   ├─ draft/
│   ├─ towers/
│   ├─ creeps/
│   ├─ spells/
│   ├─ economy/
│   ├─ reward/
│   ├─ unlocks/
│   ├─ visuals/
│   ├─ ui/
│   ├─ net/
│   └─ tests/
├─ backend/                    # Server‑side authoritative systems
│   ├─ account/
│   ├─ inventory/
│   ├─ unlock/
│   ├─ matchmaking/
│   ├─ room/
│   ├─ draft/
│   ├─ match/
│   ├─ reward/
│   ├─ websocket/
│   ├─ persistence/
│   └─ tests/
├─ data/                       # Shared balance and configuration data
│   ├─ schemas/
│   └─ samples/
├─ tools/                      # Development utilities and validation scripts
│   └─ validation/
└─ scripts/                    # Helper scripts for repo maintenance, CI, bootstrapping
```

## Purpose of each top‑level folder
- **client/** – Presentation layer, UI, local state, and non‑authoritative logic. Loads data from `data/` and sends intents via `client/net`.
- **backend/** – Authority layer; handles matchmaking, room lifecycle, draft validation, match simulation, reward calculation, unlock progression, and persistence.
- **data/** – Centralised JSON/YAML definitions for towers, creeps, spells, cost tables, draft rules, reward rules, unlock tree, etc.
- **tools/** – Scripts that aid development, especially data validation against schemas.
- **scripts/** – One‑off repository‑wide helper scripts (build, init, CI glue).

## Client module responsibilities
- Load static configuration from `data/`.
- Render UI components (visuals, UI, net messages).
- Validate user input locally, but never decide match outcomes.
- Dispatch actions to `client/net` for server processing.

## Backend module responsibilities
- **account/** – Authentication, player profile management.
- **inventory/** – Owned items, cosmetics.
- **unlock/** – Unlock tree validation, progression, cosmetic unlocks.
- **matchmaking/** – Queue management, room allocation.
- **room/** – Room lifecycle, player join/leave, ready state.
- **draft/** – Authoritative pool merging and draft turn validation.
- **match/** – Authoritative match simulation and result calculation.
- **reward/** – Server‑side reward generation and normalization.
- **websocket/** – Transport layer only; serialises messages, no game rules.
- **persistence/** – Database access, migrations, backups.
- **tests/** – Unit and integration tests for backend logic.

## Data folder responsibilities
- Store all balance‑driven definitions.
- `schemas/` – JSON Schema files that describe the structure of each data type.
- `samples/` – Minimal example files used for documentation and validation testing.

## Tools / Scripts responsibilities
- **tools/** – Validation utilities, CI integration helpers.
- **tools/validation/** – Scripts that run JSON schema validation against data files.
- **scripts/** – Repository maintenance scripts (build, init, CI runners).

## Dependency rules
1. **One‑way dependency**: client → data; backend → data. No client ↔ backend imports.
2. No circular dependencies between sub‑modules.
3. Communication only via defined WebSocket message contracts.
4. All code must respect file‑size limits (≤ 400 lines, controllers ≤ 500 lines).

## Forbidden architecture patterns
- God objects or monolithic files.
- Client directly mutating authoritative game state.
- Server code placed in client or UI folders.
- Hard‑coded balance numbers in source; all must live in `data/`.

## Adding new systems
1. Create a new sub‑folder under the appropriate top‑level module.
2. Add a `README.md` following the template (Purpose, What belongs, What must NOT, Future files).
3. Keep each source file ≤ 400 lines; split into focused modules when needed.
4. Update `PROJECT_STRUCTURE.md` and the relevant milestone in `TODO.md`.
5. Add any required schemas to `data/schemas/` and validation scripts to `tools/validation/`.
```
