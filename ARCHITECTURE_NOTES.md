# ARCHITECTURE_NOTES.md

## Why PvP‑First?
- Competitive balance is the core experience; single‑player modes are secondary.
- Community‑driven ladders and rankings drive long‑term retention.
- A focused PvP scope reduces scope creep and allows premium polish.

## Why Shared Pool Draft?
- Guarantees **fairness** regardless of who has unlocked stronger options.
- Encourages strategic decision‑making on limited resources.
- Prevents “meta lock‑in” where one player consistently dominates.

## Why Unlocks Must Not Create Permanent Stat Advantage?
- Keeps the ranked ladder merit‑based.
- Allows monetization via cosmetics and new playstyles without power‑gaming.
- Supports a healthy player ecosystem where new players can compete.

## Why Data‑Driven Balance?
- Enables rapid iteration and live‑tuning without code changes.
- Centralizes all numeric values in JSON/YAML, facilitating A/B testing.
- Reduces risk of hard‑coded bugs and eases localisation.

## Why Client Must Not Be Authoritative?
- Prevents cheating and desynchronisation.
- Server validates all actions, determines victory, rewards, and unlock progression.
- Allows future scalability to cloud‑based match hosting.

## Proposed Client Module Structure
```
client/
├─ core/            # Engine bootstrap, utilities
├─ data/            # Runtime loading of JSON data files
├─ match/           # Match state (client‑side view only)
├─ arsenal/         # Player arsenal building UI & validation
├─ draft/           # Draft UI, turn logic (client‑side visuals)
├─ towers/          # Tower prefabs, visual assets
├─ creeps/          # Creep prefabs, visual assets
├─ spells/          # Spell definitions, VFX
├─ economy/         # Cost calculations, budget UI
├─ reward/          # Reward preview UI (non‑authoritative)
├─ unlocks/         # Cosmetic unlock UI, preview
├─ visuals/         # Shaders, post‑process, 2.5D rendering helpers
├─ ui/              # Generic UI components, menus
├─ net/             # WebSocket client, message handling
└─ tests/           # Client‑side unit/integration tests
```

## Proposed Backend Module Structure

*Confirmed folder structure:* `client/`, `backend/`, `data/` with sub‑modules as defined in PROJECT_STRUCTURE.md.
*Client‑backend separation:* client holds presentation and local state; backend holds authoritative match simulation, reward, unlock, and persistence.
*Data‑driven plan:* all balance, cost, and rule definitions will live in `data/` JSON/YAML files.
*UI rule:* UI components must not directly mutate gameplay state; they only dispatch actions to client logic.
*Authority rule:* client never decides match outcome or rewards; server is authoritative.
*Balance config rule:* future balance values must be stored in `data/` schemas, never hard‑coded in code.

```
backend/
├─ account/         # Player profiles, authentication
├─ inventory/       # Owned items, cosmetics
├─ unlock/          # Unlock tree, progression logic
├─ matchmaking/    # Ranked/ELO, lobby creation
├─ room/            # Match room lifecycle management
├─ draft/           # Server‑side pool merging & draft validation
├─ match/           # Authoritative match simulation, result calc
├─ reward/          # Reward distribution, normalization
├─ websocket/       # Real‑time communication layer
├─ persistence/     # Database persistence, backups
└─ tests/           # Backend unit/integration tests
```

## Dependency Rules
- Client depends **only** on `client/data` for static configs; never on backend logic.
- Backend may reference client‑side schemas for validation but not client code.
- Shared data schemas reside in top‑level `data/` and are versioned.
- No circular dependencies; modules communicate via defined message contracts.

## Match Flow (High Level)
1. **Pre‑match**: Players select arsenals (cost‑limited) -> sent to server.
2. **Pool Merge**: Server combines selections into a Shared Pool.
3. **Draft Phase**: Server orchestrates turn‑based picks, broadcasting updates.
4. **Match Simulation**: Server runs authoritative simulation, determines winner.
5. **Post‑Match**: Server normalizes rewards, updates unlock progress, sends results.
6. **Client**: Receives final state, updates UI, plays VFX/animations.

## Draft Flow (Detailed)
- **Initialize**: Server creates DraftState with pool, player budgets.
- **Turn Loop**: Alternate player picks an item from pool.
  - Validate cost, item availability.
  - Update player’s drafted list, deduct cost.
- **End Condition**: Both players have spent their budget or pool empty.
- **Result**: Drafted arsenals are locked; sent to Match module.

## Reward/Unlock Flow
- **Reward Generation**: Server generates raw reward tokens based on performance.
- **Normalization**: Apply rank‑based scaling to ensure fairness.
- **Unlock Application**: Unlock tree is consulted; only cosmetic or new‑option unlocks are granted.
- **Persistence**: Update player profile in `backend/inventory` and `backend/unlock`.

## Open Design Questions (for future agents)
- Exact JSON schema for `unlock_tree.json` and how tiered cosmetic tiers are represented.
- Whether draft will support “ban” mechanics in later updates.
- How to handle match replay data for analytics.

---
*All architecture decisions prioritize PvP fairness, modularity, and data‑driven design.*
