# backend/tests/README.md

## Purpose
Holds unit, integration, and end‑to‑end tests for all backend modules.

## What belongs here
- Test suites for each backend sub‑module (e.g., `account`, `match`, `reward`).
- Mock implementations or fixtures for databases and external services.
- Scripts to run tests in CI (e.g., a PowerShell or Bash runner).

## What must NOT be placed here
- Production code or service implementations.
- Large binary test assets unrelated to backend logic.

## Future expected files
- `test_account.gd`
- `test_match.gd`
- `test_reward.gd`
- CI test runner configuration (e.g., `run_tests.ps1`).
