// prototype_flow.js

const VALID_TRANSITIONS = {
  "arsenal_preview": "SHOW_SHARED_POOL_PREVIEW",
  "shared_pool_preview": "SHOW_DRAFT_PREVIEW",
  "draft_preview": "SHOW_PHASE_FLOW_PREVIEW",
  "phase_flow_preview": "SHOW_RESULT_PREVIEW"
};

const ACTION_TO_SCREEN = {
  "SHOW_ARSENAL_PREVIEW": "arsenal_preview",
  "SHOW_SHARED_POOL_PREVIEW": "shared_pool_preview",
  "SHOW_DRAFT_PREVIEW": "draft_preview",
  "SHOW_PHASE_FLOW_PREVIEW": "phase_flow_preview",
  "SHOW_RESULT_PREVIEW": "result_preview"
};

/**
 * Deterministically advances the UI prototype flow.
 * @param {object} state - Current prototype state
 * @param {object} action - Action with type string
 * @returns {object} result - { ok, state, errors }
 */
export function advancePrototypeScreen(state, action) {
  const errors = [];

  if (!state || typeof state !== "object") {
    errors.push({ code: "MISSING_PROTOTYPE_STATE", message: "Prototype state is required", path: "state" });
    return { ok: false, state: null, errors };
  }

  if (!action || typeof action.type !== "string") {
    errors.push({ code: "MISSING_PROTOTYPE_ACTION", message: "Prototype action type is required", path: "action" });
    return { ok: false, state: null, errors };
  }

  if (action.type === "RESET_PROTOTYPE") {
    const nextState = JSON.parse(JSON.stringify(state));
    nextState.current_screen = "arsenal_preview";
    nextState.ui_events.push({ type: action.type, timestamp: Date.now() });
    return { ok: true, state: nextState, errors: [] };
  }

  if (!ACTION_TO_SCREEN[action.type]) {
    errors.push({ code: "INVALID_PROTOTYPE_ACTION", message: `Unknown action type ${action.type}`, path: "action.type" });
    return { ok: false, state: null, errors };
  }

  const expectedAction = VALID_TRANSITIONS[state.current_screen];
  if (expectedAction !== action.type) {
    errors.push({
      code: "INVALID_PROTOTYPE_SCREEN_TRANSITION",
      message: `Cannot apply ${action.type} from ${state.current_screen}`,
      path: "action.type"
    });
    return { ok: false, state: null, errors };
  }

  const nextScreen = ACTION_TO_SCREEN[action.type];
  if (!nextScreen) {
    errors.push({ code: "INVALID_PROTOTYPE_SCREEN", message: `Unknown target screen for action ${action.type}`, path: "action.type" });
    return { ok: false, state: null, errors };
  }

  const nextState = JSON.parse(JSON.stringify(state));
  nextState.current_screen = nextScreen;
  nextState.ui_events.push({ type: action.type, timestamp: Date.now() });

  return { ok: true, state: nextState, errors: [] };
}
