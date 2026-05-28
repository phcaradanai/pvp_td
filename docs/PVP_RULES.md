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

## Local Pre-Match Flow
The deterministic setup before a match begins follows this strict validation pipeline:
1. **Arsenal Validation**: Check both players' pre-match selections against cost limits and unlock rules.
2. **Shared Pool Generation**: Merge valid arsenals and base pool into a single shared pool.
3. **Draft Validation**: Ensure both players' final loadouts only pick from the shared pool and obey slot limits.
4. **Ready to Start**: Only if all steps pass is a deterministic `ready_to_start` match state generated.

## Local Placeholder Phase Flow
The match state can be deterministically wired end-to-end for integration testing through these phases:
- `match_skeleton` → `ready_to_start` → `planning` → `battle_preview` → `result_preview` → `mock_result` → `reward_preview`
- `result_preview` can generate a deterministic mock result based on core HP only.
- `mock_result` can generate deterministic post-match rewards and unlock progress.
- `reward_preview` is a non-authoritative client UI state to visualize post-match progression.
*(Note: Real combat resolution and economy persistence are not implemented yet. Rewards do not affect ranked PvP stats directly.)*

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
- **Client must not submit rewards**: Match result submissions must not contain any reward calculations, these are rejected by contract.
- **Server validation**: Server validates the match result submission context (e.g. valid match phase) before any reward claim is computed.
- **API Boundary**: The client submits the match result preview; the backend validates it and strictly owns the resulting reward claim preview calculation via server-side logic.
- **Match Participation**: Only authenticated match participants (verified via `validateMatchParticipation`) may submit match results or request reward claim previews. Spectators and unauthorized sessions are rejected.

## Anti‑Cheat Principles
- Validate all incoming messages against expected schemas.
- Use signed timestamps and sequence numbers to prevent replay attacks.
- Periodic integrity checks of client‑reported state against server‑side simulation.

## Persistence Authority
- Saved match results and reward claims must come from validated backend contract outputs only.
- Persistence must not bypass auth/session or match participation checks.
- Match result persistence can only happen after protected API validation succeeds.
- Duplicate result/reward requests must be idempotent and must not duplicate rewards.
- Duplicate protected match result/reward claim requests must return an idempotent replay response instead of repeating persistence.
- Only active, non-revoked sessions can submit protected PvP requests.
- Protected PvP requests should use active, non-revoked store-backed sessions as the future API authority boundary.

## Match Store Authority

- In production, match participation must be validated against the authoritative match store, not client-submitted `match_context` fixtures.
- Protected PvP actions (match result submission, reward claims) must verify that the requesting player is in `allowed_player_ids` of the stored match record before proceeding.
- A future database-backed match store adapter must implement the same store contract as `backend/match_store/in_memory_match_store.mjs`.

## Godot Prototype (M24)

The Godot 4.6.2 scene prototype (`godot_prototype/`) demonstrates the 7-screen PvP flow in a real game engine. No real combat, networking, or backend calls are made. Screen data is loaded from `godot_prototype/data/sample_pvp_flow.json` at startup. The prototype enforces the view-model boundary: the controller reads from State and ViewModel only, and never mutates gameplay state directly through UI events.

## Disconnect / Reconnect Principles
- If a player disconnects during draft, a timeout expires and the opponent may claim a win or the match is aborted based on lobby rules.
- Reconnected players resume from the last confirmed server state.
- Persistent match logs allow post‑match review for fairness.
