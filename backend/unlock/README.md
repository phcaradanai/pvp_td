# backend/unlock/README.md

## Purpose
Manages unlock validation, progression rules, and cosmetic/option unlocks.

## What belongs here
- Unlock tree definitions.
- Services to check eligibility, apply unlocks, and query player unlock state.
- Validation that unlocks do not affect core gameplay stats.
- Must reject any unlock that grants permanent PvP stat advantages as per `reward_claim_contract.mjs`.

## What must NOT be placed here
- Direct gameplay logic or match result calculations.
- UI rendering code.

## Future expected files
- `unlock_service.gd`
- `unlock_repository.gd`
