// prototype_view_model.js

/**
 * Converts raw prototype state into UI-friendly layout sections.
 * @param {object} state - Prototype UI state
 * @returns {object} View model for rendering
 */
export function buildPrototypeViewModel(state) {
  if (!state) return null;

  return {
    header: {
      title: formatTitle(state.current_screen),
      phase: state.phase
    },
    player_panels: {
      player_a: extractPlayerInfo(state.player_a),
      player_b: extractPlayerInfo(state.player_b)
    },
    arsenal_panel: {
      player_a: state.player_a?.arsenal || null,
      player_b: state.player_b?.arsenal || null
    },
    shared_pool_panel: state.shared_pool ? {
      total_items: countItems(state.shared_pool),
      categories: Object.keys(state.shared_pool).map(cat => ({
        name: cat,
        items: state.shared_pool[cat] || []
      })).filter(cat => cat.items.length > 0)
    } : null,
    draft_panel: {
      player_a: state.final_drafts?.player_a || null,
      player_b: state.final_drafts?.player_b || null
    },
    phase_panel: {
      current: state.phase,
      is_active: state.current_screen === "phase_flow_preview" || state.current_screen === "result_preview",
      history: ["ready_to_start", "planning", "battle_preview", "result_preview"]
    },
    result_panel: state.mock_result ? {
      winner: state.mock_result.winner || "Draw",
      reason: state.mock_result.reason,
      core_hp_a: state.mock_result.core_hp?.player_a ?? 0,
      core_hp_b: state.mock_result.core_hp?.player_b ?? 0
    } : null,
    reward_panel: state.reward_preview ? {
      rewards: state.reward_preview.rewards,
      profiles_before: state.profiles_before,
      profiles_after: state.profiles_after,
      new_unlocks: state.new_unlocks,
      notes: [
        "Prototype preview only. Production rewards must be confirmed by backend.",
        "Unlocks grant options/cosmetics only. No permanent PvP stat advantage."
      ]
    } : null,
    warnings: getWarnings(state)
  };
}

function formatTitle(screenName) {
  return screenName.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function extractPlayerInfo(playerData) {
  if (!playerData || !playerData.player_id) return null;
  return {
    id: playerData.player_id,
    has_final_loadout: !!playerData.final_loadout
  };
}

function countItems(pool) {
  if (!pool) return 0;
  return Object.values(pool).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
}

function getWarnings(state) {
  const warnings = [];
  if (state.current_screen === "draft_preview" && (!state.final_drafts?.player_a || !state.final_drafts?.player_b)) {
    warnings.push("Drafts incomplete");
  }
  return warnings;
}
