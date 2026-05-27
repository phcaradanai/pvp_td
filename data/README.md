# data/README.md

## Purpose
Holds all shared configuration and balance data for the game. All gameplay‑related values (stats, costs, rules) are defined here in a data‑driven way.

## What belongs here
- JSON/YAML files defining towers, creeps, spells, relics, guardians.
- Cost tables, arsenal rules, draft rules, reward rules, unlock tree.

## What must NOT be placed here
- Executable code or scripts.
- UI assets or visual resources.

## How to add new content
1. **Create or extend a schema** in `data/schemas/` if a new data type is introduced.
2. **Add a sample instance** in `data/samples/` following the schema.
3. **Do NOT hard‑code** any of these values in client or backend scripts; load them via the data loader.
4. Update documentation and test coverage when changes are made.

## Important rules
- Sample data provides placeholder balance values; real balance will be tuned later.
- Whenever a schema changes, all related validation tests must be updated.
- All balance changes must remain data‑driven – no constants in gameplay code.
