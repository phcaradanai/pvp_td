// local_phase_controller.mjs

const VALID_PHASES = ["ready_to_start", "planning", "battle_preview", "result_preview"];

const VALID_ACTIONS = ["START_PLANNING", "START_BATTLE_PREVIEW", "FINISH_BATTLE_PREVIEW", "RESET_TO_READY"];

const TRANSITIONS = {
  "ready_to_start": {
    "START_PLANNING": "planning"
  },
  "planning": {
    "START_BATTLE_PREVIEW": "battle_preview"
  },
  "battle_preview": {
    "FINISH_BATTLE_PREVIEW": "result_preview"
  },
  "result_preview": {
    "RESET_TO_READY": "ready_to_start"
  }
};

/**
 * Advances the local match phase deterministically based on action.
 * @param {object} input - { match_state, action }
 * @returns {object} result - { ok, match_state, errors }
 */
export function advanceLocalPhase(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    errors.push({ code: "INVALID_INPUT", message: "Input is required", path: "input" });
    return { ok: false, match_state: null, errors };
  }

  if (!input.match_state) {
    errors.push({ code: "MISSING_MATCH_STATE", message: "match_state is required", path: "match_state" });
  } else if (!VALID_PHASES.includes(input.match_state.phase)) {
    errors.push({ code: "INVALID_PHASE", message: `Invalid phase: ${input.match_state.phase}`, path: "match_state.phase" });
  }

  if (!input.action) {
    errors.push({ code: "MISSING_ACTION", message: "action is required", path: "action" });
  } else if (!input.action.type) {
    errors.push({ code: "INVALID_ACTION_TYPE", message: "action.type is required", path: "action.type" });
  } else if (!VALID_ACTIONS.includes(input.action.type)) {
    errors.push({ code: "INVALID_ACTION_TYPE", message: `Invalid action type: ${input.action.type}`, path: "action.type" });
  }

  if (errors.length > 0) {
    return { ok: false, match_state: null, errors };
  }

  const currentPhase = input.match_state.phase;
  const actionType = input.action.type;

  const validTransitionsFromCurrent = TRANSITIONS[currentPhase];
  if (!validTransitionsFromCurrent || !validTransitionsFromCurrent[actionType]) {
    errors.push({
      code: "INVALID_PHASE_TRANSITION",
      message: `Cannot apply ${actionType} from ${currentPhase}`,
      path: "action.type"
    });
    return { ok: false, match_state: null, errors };
  }

  const nextPhase = validTransitionsFromCurrent[actionType];

  // Clone match state to avoid mutating input
  const nextMatchState = JSON.parse(JSON.stringify(input.match_state));

  // Update phase
  nextMatchState.phase = nextPhase;

  // Update counters
  if (nextPhase === "planning") {
    nextMatchState.turn += 1;
  }
  if (nextPhase === "battle_preview") {
    nextMatchState.round += 1;
  }

  // Append to action log
  nextMatchState.action_log.push({
    type: "PHASE_CHANGED",
    from: currentPhase,
    to: nextPhase,
    action: actionType
  });

  return { ok: true, match_state: nextMatchState, errors: [] };
}

export default { advanceLocalPhase };
