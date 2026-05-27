# TEST_PLAN.md

## Unit Test Plan
- **Data Validation**: Tests for JSON schema compliance of all data files (towers, creeps, spells, relics, guardians, arsenal_rules, draft_rules, reward_rules, unlock_tree).
- **Module Unit Tests**: Each client module (`core`, `data`, `arsenal`, `draft`, etc.) gets isolated unit tests for pure functions.
- **Backend Services**: Unit tests for account authentication, matchmaking logic, draft validation, reward calculation.

## Integration Test Plan
- **End‑to‑End Draft**: Simulate full draft between two mock players, verify pool merging and cost limits.
- **Match Simulation**: Run authoritative match simulation with deterministic seeds, validate win/lose outcomes.
- **Reward Normalization**: Ensure post‑match reward scaling works across rank differences.

## Simulation Test Plan
- **Balance Simulations**: Run large‑scale Monte‑Carlo simulations of matches to collect win rates for each item configuration.
- **Performance Sim**: Automated stress test of match simulation to verify frame‑time budget.

## Network Test Plan
- **WebSocket Reliability**: Test reconnect handling, message ordering, and latency tolerance.
- **Packet Validation**: Ensure server rejects malformed or out‑of‑bounds messages.

## Visual QA Plan
- **Asset Validation**: Verify all 2.5D assets load correctly, appropriate LODs per graphics profile.
- **UI Consistency**: Automated UI screenshot diff tests for layout regressions.

## Performance QA Plan
- **Frame‑Rate Benchmarks**: Automated profiling on target hardware configurations (low/medium/high).
- **Memory Usage**: Track peak memory during match simulation.
- **GPU Load**: Monitor shader compile times and draw call counts.

## Release Checklist
- All unit and integration tests pass.
- Performance benchmarks meet targets (see PERFORMANCE_BUDGET.md).
- No critical lint or security issues.
- Documentation up‑to‑date (AGENT_CONTEXT, ARCHITECTURE_NOTES, etc.).
- Build passes on CI for both client and backend.

---
*Testing is integrated from the start to ensure fairness, balance, and performance throughout development.*
