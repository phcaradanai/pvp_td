// local_e2e_loop_harness.mjs
import { createLocalMatchSkeleton } from "./local_match_skeleton.mjs";
import { advanceLocalPhase } from "./local_phase_controller.mjs";
import { generateMockBattleResult } from "./mock_battle_result_preview.mjs";

/**
 * Runs a deterministic local end-to-end loop for the placeholder phases.
 * @param {object} input - E2E input wrapping local match skeleton requirements and seed.
 * @param {object} catalog - The game catalog data for validation.
 * @returns {object} result - { ok, final_match_state, result, trace, errors }
 */
export function runLocalE2ELoop(input, catalog) {
  const trace = [];
  const errors = [];

  if (!input || typeof input !== "object" || !input.match_id) {
    errors.push({ code: "INVALID_E2E_INPUT", message: "Input with match_id is required", path: "input.match_id" });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }

  // 1. Create Local Match
  const matchInput = {
    match_id: input.match_id,
    player_a: input.player_a,
    player_b: input.player_b
  };

  const skeletonResult = createLocalMatchSkeleton(matchInput, catalog);
  if (!skeletonResult.ok) {
    errors.push({
      code: "LOCAL_MATCH_CREATION_FAILED",
      message: "Local match creation failed",
      path: "local_match",
      details: skeletonResult.errors
    });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }

  let currentState = skeletonResult.match_state;
  trace.push({ step: "CREATE_LOCAL_MATCH", phase: currentState.phase });

  // Optional: Apply core HP override for test fixtures (NOT combat)
  if (input.core_hp_override) {
    currentState.core_hp = JSON.parse(JSON.stringify(input.core_hp_override));
  }

  // 2. Advance ready_to_start -> planning
  const planningResult = advanceLocalPhase({ match_state: currentState, action: { type: "START_PLANNING" } });
  if (!planningResult.ok) {
    errors.push({
      code: "PHASE_TRANSITION_FAILED",
      message: "Failed to transition to planning",
      path: "advanceLocalPhase",
      details: planningResult.errors
    });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }
  currentState = planningResult.match_state;
  trace.push({ step: "START_PLANNING", phase: currentState.phase });

  // 3. Advance planning -> battle_preview
  const battlePreviewResult = advanceLocalPhase({ match_state: currentState, action: { type: "START_BATTLE_PREVIEW" } });
  if (!battlePreviewResult.ok) {
    errors.push({
      code: "PHASE_TRANSITION_FAILED",
      message: "Failed to transition to battle_preview",
      path: "advanceLocalPhase",
      details: battlePreviewResult.errors
    });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }
  currentState = battlePreviewResult.match_state;
  trace.push({ step: "START_BATTLE_PREVIEW", phase: currentState.phase });

  // 4. Advance battle_preview -> result_preview
  const resultPreviewResult = advanceLocalPhase({ match_state: currentState, action: { type: "FINISH_BATTLE_PREVIEW" } });
  if (!resultPreviewResult.ok) {
    errors.push({
      code: "PHASE_TRANSITION_FAILED",
      message: "Failed to transition to result_preview",
      path: "advanceLocalPhase",
      details: resultPreviewResult.errors
    });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }
  currentState = resultPreviewResult.match_state;
  trace.push({ step: "FINISH_BATTLE_PREVIEW", phase: currentState.phase });

  // 5. Generate mock battle result
  const mockResultPayload = generateMockBattleResult({ match_state: currentState, seed: input.seed });
  if (!mockResultPayload.ok) {
    errors.push({
      code: "MOCK_RESULT_GENERATION_FAILED",
      message: "Failed to generate mock result",
      path: "generateMockBattleResult",
      details: mockResultPayload.errors
    });
    return { ok: false, final_match_state: null, result: null, trace, errors };
  }
  currentState = mockResultPayload.match_state;
  trace.push({ step: "GENERATE_MOCK_RESULT", phase: currentState.phase });

  return {
    ok: true,
    final_match_state: currentState,
    result: mockResultPayload.result,
    trace,
    errors: []
  };
}

export default { runLocalE2ELoop };
