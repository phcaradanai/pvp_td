// reward_claim_contract.mjs
import { createContractError } from "./backend_contract_errors.mjs";
import { calculateMockRewards, calculateUnlockProgress } from "../../tools/validation/src/reward_unlock_mock.mjs";

export function buildRewardClaimPreview(input, catalog) {
  const errors = [];

  if (!input.request_id) {
    errors.push(createContractError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.match_result) {
    errors.push(createContractError("MISSING_MATCH_RESULT", "match_result is required", "match_result"));
  }
  if (!input.players) {
    errors.push(createContractError("MISSING_PLAYERS", "players is required", "players"));
  }

  if (errors.length > 0) {
    return { ok: false, claim_preview: null, errors };
  }

  // Use reward_unlock_mock to calculate rewards safely (deterministic, pure)
  const rewardInput = {
    match_result: input.match_result,
    players: input.players
  };
  
  const rewardRes = calculateMockRewards(rewardInput, catalog);
  if (!rewardRes.ok) {
    // Collect mock errors and wrap in REWARD_CALCULATION_FAILED
    errors.push(createContractError("REWARD_CALCULATION_FAILED", "Reward calculation failed", "match_result", rewardRes.errors));
    return { ok: false, claim_preview: null, errors };
  }

  const unlockInput = {
    rewards: rewardRes.rewards,
    players: input.players
  };

  const unlockRes = calculateUnlockProgress(unlockInput, catalog);
  if (!unlockRes.ok) {
    // Collect mock errors and wrap in UNLOCK_PROGRESS_FAILED
    errors.push(createContractError("UNLOCK_PROGRESS_FAILED", "Unlock progression failed", "players", unlockRes.errors));
    return { ok: false, claim_preview: null, errors };
  }

  return {
    ok: true,
    claim_preview: {
      match_id: input.match_result.match_id,
      rewards: rewardRes.rewards,
      profiles: unlockRes.profiles
    },
    errors: []
  };
}
