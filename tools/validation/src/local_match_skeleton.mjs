// local_match_skeleton.mjs
import { buildSharedPool } from "./shared_pool_builder.mjs";
import { validateDraft } from "./draft_validator.mjs";

/**
 * Creates a deterministic local match state by wiring validators.
 * @param {object} input - local match input with match_id, player_a, player_b
 * @param {object} catalog - the sample catalog
 * @returns {object} result - { ok, match_state, errors }
 */
export function createLocalMatchSkeleton(input, catalog) {
  const errors = [];

  if (!input || typeof input !== "object") {
    errors.push({ code: "INVALID_LOCAL_MATCH_STATE", message: "Input is invalid", path: "input", details: [] });
    return { ok: false, match_state: null, errors };
  }

  if (!input.match_id) {
    errors.push({ code: "MISSING_MATCH_ID", message: "match_id is required", path: "match_id", details: [] });
  }
  if (!input.player_a) {
    errors.push({ code: "MISSING_PLAYER_A", message: "player_a is required", path: "player_a", details: [] });
  }
  if (!input.player_b) {
    errors.push({ code: "MISSING_PLAYER_B", message: "player_b is required", path: "player_b", details: [] });
  }

  if (errors.length > 0) {
    return { ok: false, match_state: null, errors };
  }

  // 1 & 2. Validate arsenals and build shared pool
  const poolResult = buildSharedPool({ player_a: input.player_a, player_b: input.player_b }, catalog);
  if (!poolResult.ok) {
    errors.push({
      code: "SHARED_POOL_BUILD_FAILED",
      message: "Failed to build shared pool from arsenals",
      path: "shared_pool",
      details: poolResult.errors
    });
    return { ok: false, match_state: null, errors };
  }

  const sharedPool = poolResult.shared_pool;

  // 3. Validate Player A final_loadout
  const draftInputA = {
    player_id: input.player_a.player_id,
    shared_pool: sharedPool,
    final_loadout: input.player_a.final_loadout
  };
  const draftResultA = validateDraft(draftInputA, catalog);
  if (!draftResultA.ok) {
    errors.push({
      code: "PLAYER_A_DRAFT_INVALID",
      message: "Player A final draft is invalid",
      path: "player_a.final_loadout",
      details: draftResultA.errors
    });
  }

  // 4. Validate Player B final_loadout
  const draftInputB = {
    player_id: input.player_b.player_id,
    shared_pool: sharedPool,
    final_loadout: input.player_b.final_loadout
  };
  const draftResultB = validateDraft(draftInputB, catalog);
  if (!draftResultB.ok) {
    errors.push({
      code: "PLAYER_B_DRAFT_INVALID",
      message: "Player B final draft is invalid",
      path: "player_b.final_loadout",
      details: draftResultB.errors
    });
  }

  if (errors.length > 0) {
    return { ok: false, match_state: null, errors };
  }

  // 6. If all pass, return deterministic state
  // 7. Do not mutate input (clone final loadouts)
  const matchState = {
    match_id: input.match_id,
    phase: "ready_to_start",
    players: {
      player_a: {
        player_id: input.player_a.player_id,
        final_loadout: JSON.parse(JSON.stringify(input.player_a.final_loadout))
      },
      player_b: {
        player_id: input.player_b.player_id,
        final_loadout: JSON.parse(JSON.stringify(input.player_b.final_loadout))
      }
    },
    shared_pool: JSON.parse(JSON.stringify(sharedPool)),
    turn: 0,
    round: 0,
    core_hp: {
      player_a: 100,
      player_b: 100
    },
    winner: null,
    action_log: []
  };

  return { ok: true, match_state: matchState, errors: [] };
}

export default { createLocalMatchSkeleton };
