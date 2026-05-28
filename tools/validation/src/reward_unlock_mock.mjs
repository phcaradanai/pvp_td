export function calculateMockRewards(input, catalog) {
  if (!input) return { ok: false, errors: [{ code: "INVALID_REWARD_INPUT", message: "Input is missing" }] };
  if (!input.match_result) return { ok: false, errors: [{ code: "MISSING_MATCH_RESULT", message: "Missing match_result" }] };
  if (!input.players) return { ok: false, errors: [{ code: "MISSING_PLAYERS", message: "Missing players" }] };
  
  if (!catalog || !catalog.reward_rules) {
    return { ok: false, errors: [{ code: "INVALID_REWARD_RULES", message: "Missing or invalid reward rules in catalog" }] };
  }

  const mr = input.match_result;
  const rules = catalog.reward_rules;
  
  if (!rules.enabled) {
    return { ok: false, errors: [{ code: "INVALID_REWARD_RULES", message: "Reward rules are disabled" }] };
  }
  
  if (!rules.win || !rules.draw || !rules.participation) {
    return { ok: false, errors: [{ code: "INVALID_REWARD_RULES", message: "Reward rules missing win/draw/participation" }] };
  }

  const pA = input.players.player_a;
  const pB = input.players.player_b;

  if (!pA) return { ok: false, errors: [{ code: "UNKNOWN_PLAYER", message: "Player A is missing" }] };
  if (!pB) return { ok: false, errors: [{ code: "UNKNOWN_PLAYER", message: "Player B is missing" }] };
  if (!pA.profile) return { ok: false, errors: [{ code: "INVALID_PLAYER_PROFILE", message: "Player A profile missing" }] };
  if (!pB.profile) return { ok: false, errors: [{ code: "INVALID_PLAYER_PROFILE", message: "Player B profile missing" }] };

  if (mr.winner !== "player_a" && mr.winner !== "player_b" && !mr.is_draw) {
    return { ok: false, errors: [{ code: "INVALID_MATCH_RESULT", message: "Invalid winner or draw state" }] };
  }

  const rewards = {};
  
  if (mr.is_draw) {
    rewards.player_a = { player_id: "player_a", xp_delta: rules.draw.xp, soft_currency_delta: rules.draw.soft_currency, reason: "DRAW_REWARD" };
    rewards.player_b = { player_id: "player_b", xp_delta: rules.draw.xp, soft_currency_delta: rules.draw.soft_currency, reason: "DRAW_REWARD" };
  } else if (mr.winner === "player_a") {
    rewards.player_a = { player_id: "player_a", xp_delta: rules.win.xp, soft_currency_delta: rules.win.soft_currency, reason: "WIN_REWARD" };
    rewards.player_b = { player_id: "player_b", xp_delta: rules.participation.xp, soft_currency_delta: rules.participation.soft_currency, reason: "PARTICIPATION_REWARD" };
  } else if (mr.winner === "player_b") {
    rewards.player_a = { player_id: "player_a", xp_delta: rules.participation.xp, soft_currency_delta: rules.participation.soft_currency, reason: "PARTICIPATION_REWARD" };
    rewards.player_b = { player_id: "player_b", xp_delta: rules.win.xp, soft_currency_delta: rules.win.soft_currency, reason: "WIN_REWARD" };
  }

  return { ok: true, rewards, errors: [] };
}

export function calculateUnlockProgress(input, catalog) {
  if (!input) return { ok: false, errors: [{ code: "INVALID_UNLOCK_INPUT", message: "Input is missing" }] };
  if (!input.players) return { ok: false, errors: [{ code: "MISSING_PLAYERS", message: "Missing players" }] };
  if (!input.rewards) return { ok: false, errors: [{ code: "INVALID_UNLOCK_INPUT", message: "Missing rewards" }] };
  
  if (!catalog || !catalog.unlock_tree) {
    return { ok: false, errors: [{ code: "INVALID_UNLOCK_TREE", message: "Missing unlock tree in catalog" }] };
  }

  for (const node of catalog.unlock_tree) {
    if (node.grants_stat_advantage) {
      return { ok: false, errors: [{ code: "UNLOCK_GRANTS_PVP_STAT_ADVANTAGE", message: `Unlock node ${node.id} grants stat advantage` }] };
    }
  }

  const profiles = {};

  for (const [playerId, playerInput] of Object.entries(input.players)) {
    if (!playerInput.profile) {
      return { ok: false, errors: [{ code: "INVALID_PLAYER_PROFILE", message: `Player ${playerId} missing profile` }] };
    }

    const reward = input.rewards[playerId] || { xp_delta: 0, soft_currency_delta: 0 };
    
    // Create new profile object (do not mutate input)
    const newProfile = {
      level: playerInput.profile.level,
      xp: playerInput.profile.xp + (reward.xp_delta || 0),
      soft_currency: playerInput.profile.soft_currency + (reward.soft_currency_delta || 0),
      unlocked_ids: [...(playerInput.profile.unlocked_ids || [])]
    };

    const newUnlocks = [];

    // Simple deterministic check for new unlocks (in reality, player would purchase them, 
    // but here we just auto-unlock if they can afford it for the mock)
    // Actually the prompt says "no unlock when threshold not met, option unlock works when threshold met"
    // So we just iterate through unlock tree and auto-unlock anything they have level/currency for and don't already have.
    for (const node of catalog.unlock_tree) {
      if (!node.enabled) continue;
      if (newProfile.unlocked_ids.includes(node.id)) continue;
      
      const hasLevel = newProfile.level >= node.account_level_required;
      // Let's just check cost threshold against soft_currency regardless of currency type since it's a mock
      let canAfford = false;
      if (newProfile.soft_currency >= node.cost) {
        canAfford = true;
      }

      // Prerequisites check
      const hasPrereqs = node.prerequisites.every(req => newProfile.unlocked_ids.includes(req));

      if (hasLevel && canAfford && hasPrereqs) {
        newProfile.unlocked_ids.push(node.id);
        newUnlocks.push(node.id);
        // Deduct cost
        newProfile.soft_currency -= node.cost;
      }
    }

    profiles[playerId] = {
      player_id: playerId,
      profile: newProfile,
      new_unlocks: newUnlocks
    };
  }

  return { ok: true, profiles, errors: [] };
}
