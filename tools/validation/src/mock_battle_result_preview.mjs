// mock_battle_result_preview.mjs

/**
 * Generates a deterministic fake battle result from a valid result_preview match state.
 * @param {object} input - { match_state, seed }
 * @returns {object} result - { ok, match_state, result, errors }
 */
export function generateMockBattleResult(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    errors.push({ code: "INVALID_INPUT", message: "Input is required", path: "input" });
    return { ok: false, match_state: null, result: null, errors };
  }

  if (!input.match_state) {
    errors.push({ code: "MISSING_MATCH_STATE", message: "match_state is required", path: "match_state" });
    return { ok: false, match_state: null, result: null, errors };
  }

  const ms = input.match_state;

  if (ms.phase !== "result_preview") {
    errors.push({
      code: "INVALID_RESULT_PHASE",
      message: "Mock battle result can only be generated from result_preview phase",
      path: "match_state.phase"
    });
  }

  if (!ms.players || !ms.players.player_a || !ms.players.player_b) {
    errors.push({ code: "MISSING_PLAYERS", message: "Both players must exist", path: "match_state.players" });
  }

  if (!ms.core_hp) {
    errors.push({ code: "MISSING_CORE_HP", message: "core_hp is required", path: "match_state.core_hp" });
  } else if (typeof ms.core_hp.player_a !== "number" || typeof ms.core_hp.player_b !== "number") {
    errors.push({ code: "INVALID_CORE_HP", message: "core_hp values must be numbers", path: "match_state.core_hp" });
  }

  if (ms.action_log && ms.action_log.some(a => a.type === "MOCK_BATTLE_RESULT_GENERATED")) {
    errors.push({
      code: "MOCK_RESULT_ALREADY_GENERATED",
      message: "A mock result has already been generated for this match state",
      path: "match_state.action_log"
    });
  }

  if (errors.length > 0) {
    return { ok: false, match_state: null, result: null, errors };
  }

  // Determine winner
  const hpA = ms.core_hp.player_a;
  const hpB = ms.core_hp.player_b;

  let winner = null;
  let is_draw = false;
  let reason = "";

  if (hpA > hpB) {
    winner = "player_a";
    is_draw = false;
    reason = "PLAYER_A_HIGHER_CORE_HP";
  } else if (hpB > hpA) {
    winner = "player_b";
    is_draw = false;
    reason = "PLAYER_B_HIGHER_CORE_HP";
  } else {
    winner = null;
    is_draw = true;
    reason = "EQUAL_CORE_HP_PLACEHOLDER_DRAW";
  }

  // Clone to avoid mutating input
  const nextMatchState = JSON.parse(JSON.stringify(ms));

  if (winner) {
    nextMatchState.winner = winner;
  }

  nextMatchState.action_log.push({
    type: "MOCK_BATTLE_RESULT_GENERATED",
    winner,
    is_draw,
    reason
  });

  const resultObj = {
    match_id: nextMatchState.match_id,
    winner,
    is_draw,
    reason,
    score: {
      player_a: {
        core_hp: hpA
      },
      player_b: {
        core_hp: hpB
      }
    }
  };

  return { ok: true, match_state: nextMatchState, result: resultObj, errors: [] };
}

export default { generateMockBattleResult };
