# tools/validation/README.md

## Purpose
Provides scripts and utilities that validate game‑balance data against the JSON Schemas defined in `data/schemas/`.

## What belongs here
- Schema validation command‑line tools (e.g., a Python script using `jsonschema`).
- CI integration snippets that run validation on commit.
- Documentation on how to add new schemas and update validation rules.

## What must NOT be placed here
- Game source code or runtime logic.
- Large binary assets.

## Future expected files
- `validate_data.py`
- `ci_check.sh`
