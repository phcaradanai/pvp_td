# PVP_RULES.md

## PvP Fairness Rules
1. **Shared Pool Draft** is the primary mechanic to ensure equal access to all options.
2. **Cost Limit**: Each player has an identical budget; total cost of selected items must not exceed it.
3. **Normalization**: Post‑match rewards are scaled to prevent runaway advantage.
4. **Ranked Matchmaking**: Uses hidden ELO, enforces anti‑cheat and fair pairing.
5. **Server Authority**: All critical game state (draft picks, match outcome, rewards) is decided on the server.
6. **No Hidden Bonuses**: Cosmetic unlocks are purely visual; gameplay unlocks only add new options, never modify existing stats.

## Shared Pool Rules
- The pool contains the union of both players’ pre‑match selections.
- Duplicate items are merged; each unique item appears once with a combined count.
- Draft picks remove items from the pool for both players.

## Draft Rules
- Turn order is deterministic (e.g., 1‑2‑2‑1) and visible to both players.
- Players may only pick items they can afford within remaining budget.
- Draft cannot be aborted; once started, it runs to completion.
- Optional future rule: bans may be added in later updates.

## Ranked Fairness Rules
- Match outcomes affect rank only after normalization to mitigate streaks.
- Players cannot gain permanent statistical advantage via unlocks.
- Anti‑cheat monitors for speed‑hacks, packet manipulation, and unauthorized state changes.

## Server Authority Rules
- The client sends intent (e.g., draft pick) but the server validates cost and pool state.
- Victory, reward distribution, and unlock progression are computed server‑side.
- Any client‑side prediction must be reconciled with authoritative server results.

## Anti‑Cheat Principles
- Validate all incoming messages against expected schemas.
- Use signed timestamps and sequence numbers to prevent replay attacks.
- Periodic integrity checks of client‑reported state against server‑side simulation.

## Disconnect / Reconnect Principles
- If a player disconnects during draft, a timeout expires and the opponent may claim a win or the match is aborted based on lobby rules.
- Reconnected players resume from the last confirmed server state.
- Persistent match logs allow post‑match review for fairness.
