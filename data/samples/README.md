# Sample Data Directory

This directory contains example JSON files that conform to the schemas defined in `data/schemas/`. They serve as:

- **Reference implementations** for designers and programmers.
- **Test fixtures** for automated validation and unit tests.
- **Starting points** for creating real balance data later.

## Files
- `towers.sample.json` – Example tower definitions.
- `creeps.sample.json` – Example creep definitions.
- `spells.sample.json` – Example spell definitions.
- `relics.sample.json` – Example relic definitions.
- `guardians.sample.json` – Example guardian definitions.
- `arsenal_rules.sample.json` – Example cost‑budget and slot limits.
- `draft_rules.sample.json` – Example draft configuration.
- `reward_rules.sample.json` – Example reward structure for win/loss.
- `unlock_tree.sample.json` – Example unlock definitions (all `grants_stat_advantage: false`).
- `invalid_tower.sample.json` – Minimal malformed tower used for negative testing.
- `arsenals.valid.sample.json` / `arsenals.invalid.sample.json` - Arsenal cost validation fixtures.
- `shared_pool.valid.sample.json` / `shared_pool.invalid.sample.json` - Shared pool builder fixtures.
- `draft.valid.sample.json` / `draft.invalid.sample.json` - Draft validation fixtures.
- `local_match.valid.sample.json` / `local_match.invalid.sample.json` - Local match skeleton fixtures.
- `local_phase.valid.sample.json` and `.invalid.sample.json`: Fixtures for phase flow controller testing.
- `mock_result.valid.sample.json` and `.invalid.sample.json`: Fixtures for testing deterministic placeholder result generation.
- `local_e2e.valid.sample.json` and `.invalid.sample.json`: Fixtures for testing the end-to-end integration harness.
- `reward_mock.valid.sample.json` and `.invalid.sample.json`: Fixtures for testing deterministic reward calculation and unlock progress.

## Naming Conventions
All IDs use **snake_case** as agreed in the design decisions.

## Usage
1. Load a schema with the chosen validator (`ajv`).
2. Validate each `*.sample.json` file against its schema.
3. Edit the files to tune balance, add new entries, or create additional variants.
