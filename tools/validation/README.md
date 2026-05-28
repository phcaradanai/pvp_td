# tools/validation/README.md

## Purpose
Provides scripts and utilities that validate game‑balance data against the JSON Schemas defined in `data/schemas/`.

## What belongs here
- Schema validation tools (`validate_data.mjs`).
- Game rule validators: `arsenal_cost_validator.mjs`, `shared_pool_builder.mjs`, `draft_validator.mjs`.
- `local_match_skeleton.mjs`: Wires validators together to create a deterministic pre-match flow (ready_to_start). This is pure validation and setup, NOT gameplay or combat.
- `local_phase_controller.mjs`: Advances the match state through placeholder phases (ready_to_start -> planning -> battle_preview -> result_preview). It does NOT simulate real combat.
- `mock_battle_result_preview.mjs`: Generates deterministic placeholder results from the `result_preview` phase based on core HP. Does NOT simulate real combat.
- CI integration snippets that run validation on commit.

## What must NOT be placed here
- Game source code or runtime logic.
- Real combat or gameplay simulation.
- Large binary assets.

## Existing files
- `validate_data.mjs`
- `src/catalog_loader.mjs`
- `src/arsenal_cost_validator.mjs`
- `src/shared_pool_builder.mjs`
- `src/draft_validator.mjs`
- `src/local_match_skeleton.mjs`
- `tests/*.test.mjs`
