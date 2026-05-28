# UNLOCK_RULES.md

## Unlock Philosophy
- Unlocks **enhance** player identity and strategic diversity **without** granting permanent PvP power advantage.
- All unlocks are either **cosmetic** or **new option** unlocks (new towers, creeps, spells, relics, guardians).
- Unlocks are earned through gameplay, rank progression, or optional purchase; they must not affect balance of existing items.

## Backend Authority
- All unlock progression is ultimately computed and validated by the backend. The client may preview progression using mock local states (e.g. the visual reward preview screen), but the production server retains full authority.
- **Visual Reward Preview**: Any client-side visual display of post-match unlocks must clearly communicate that it is a preview and must never assume permanent PvP stat advantages. Even in API preview handlers, any unlock configuration that grants a stat advantage will be strictly rejected.

## Allowed Unlocks
- **Cosmetics**: Skins, particle effects, UI themes, avatar accessories.
- **New Options**: Additional tower types, spell variants, creep families, relics, guardians that become available for selection in the draft pool.
- **Mastery/Titles**: Badges or profile items that prove dedication.
- **CRITICAL RULE**: Unlocks must NEVER grant permanent PvP stat advantages (e.g. no +10% damage to towers). They grant horizontal options or aesthetics only.

## Forbidden Unlocks
- Direct stat boosts to existing towers/creeps/spells (e.g., +damage, reduced cooldown).
- Cost reductions for existing items.
- Any modification that changes the outcome of a match for a player who possesses the unlock.
- Unlocks that bypass the shared pool draft (e.g., permanent exclusive items).

## Gameplay Unlock Rules
- Unlocks are **data‑driven**; each unlock entry in `unlock_tree.json` defines the item(s) it grants.
- Unlocks may be **conditional** on achieving certain milestones (e.g., rank, win streak) but never on payment alone for power.
- When an unlock provides a new option, the associated item must be balanced by design and added to the data pool.

## Cosmetic Unlock Rules
- Purely visual; attached to existing items or player avatar.
- May include animated skins, particle trails, UI flair.
- No impact on gameplay metrics (damage, range, cooldown, etc.).

## Mastery Rules
- Mastery levels represent player proficiency with an item; they **do not** alter item stats.
- Mastery may unlock cosmetic flourishes (e.g., aura effects) or badge icons.
- Mastery progression is tracked server‑side and displayed client‑side.

## Ranked Normalization Rules
- In ranked matches, rewards are normalized based on opponent skill and match difficulty.
- Unlock progression from ranked play is limited to **new options** and cosmetics; no direct stat advantages are granted.
- Seasonal resets may grant cosmetic rewards but keep core balance unchanged.

---
*All unlock design decisions aim to preserve a merit‑based competitive environment while rewarding player investment and identity.*
