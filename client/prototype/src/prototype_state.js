// prototype_state.js

/**
 * Creates the initial stable client-side prototype state shape.
 * @param {object} sampleInput - A simplified sample local match state to bootstrap the prototype.
 * @returns {object} Initial prototype state.
 */
export function createInitialPrototypeState(sampleInput = {}) {
  return {
    current_screen: "arsenal_preview",
    player_a: {
      ...sampleInput.players?.player_a,
      arsenal: sampleInput.initial_arsenals?.player_a || null
    },
    player_b: {
      ...sampleInput.players?.player_b,
      arsenal: sampleInput.initial_arsenals?.player_b || null
    },
    shared_pool: sampleInput.shared_pool || null,
    final_drafts: {
      player_a: sampleInput.players?.player_a?.final_loadout || null,
      player_b: sampleInput.players?.player_b?.final_loadout || null
    },
    phase: sampleInput.phase || "not_started",
    mock_result: extractMockResult(sampleInput),
    reward_preview: sampleInput.reward_preview || null,
    profiles_before: sampleInput.profiles_before || null,
    profiles_after: sampleInput.profiles_after || null,
    new_unlocks: sampleInput.new_unlocks || {},
    reward_errors: sampleInput.reward_errors || [],
    ui_events: []
  };
}

function extractMockResult(sampleInput) {
  const resultAction = sampleInput.action_log?.find(a => a.type === "MOCK_BATTLE_RESULT_GENERATED");
  if (resultAction) {
    return {
      winner: resultAction.winner,
      is_draw: resultAction.is_draw,
      reason: resultAction.reason,
      core_hp: sampleInput.core_hp || null
    };
  }
  return null;
}
