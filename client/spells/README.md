# client/spells/README.md

## Purpose
Contains spell prefab definitions and visual assets.

## What belongs here
- Spell scene files (e.g., `.tscn`).
- Visual resources for spells (particles, icons, animations).
- References to data definitions in `data/` for spell parameters.

## What must NOT be placed here
- Spell damage or cooldown logic – handled server‑side in `backend/match/`.
- Authority or reward calculations.

## Future expected files
- `basic_spell.tscn`
- `spell_config.json` (placeholder linking to data definitions).
