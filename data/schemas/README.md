# Schema Directory

This directory contains JSON Schema definitions for all core game data entities.

## Purpose
- Define the structure, required fields, and data types for each entity.
- Serve as the single source of truth for balance and validation.

## Usage
- Validation scripts (e.g., using **ajv** in JavaScript) will load these schemas to verify JSON files in `data/samples/`.
- When adding new entities, update the corresponding schema and bump the version if necessary.

## Update Process
1. Add or modify properties following JSON Schema draft‑07 syntax.
2. Run the validator (`npm run validate-data`) to ensure all sample files still conform.
3. Commit changes with a clear description of the schema modifications.
