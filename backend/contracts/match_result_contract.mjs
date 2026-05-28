// match_result_contract.mjs
import { createContractError } from "./backend_contract_errors.mjs";

export function validateMatchResultSubmission(input) {
  const errors = [];

  if (!input.request_id) {
    errors.push(createContractError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.match_id) {
    errors.push(createContractError("MISSING_MATCH_ID", "match_id is required", "match_id"));
  }
  if (!input.submitted_by) {
    errors.push(createContractError("MISSING_SUBMITTED_BY", "submitted_by is required", "submitted_by"));
  }
  if (!input.server_context) {
    errors.push(createContractError("MISSING_SERVER_CONTEXT", "server_context is required", "server_context"));
  }
  if (!input.client_result_preview) {
    errors.push(createContractError("MISSING_CLIENT_RESULT_PREVIEW", "client_result_preview is required", "client_result_preview"));
  }

  // Reject client submitted rewards immediately
  const forbiddenFields = ["rewards", "reward", "xp_delta", "soft_currency_delta", "unlocks", "new_unlocks"];
  for (const field of forbiddenFields) {
    if (input[field] !== undefined || (input.client_result_preview && input.client_result_preview[field] !== undefined)) {
      errors.push(createContractError("CLIENT_REWARD_NOT_ALLOWED", "Client submitted rewards are not allowed", field));
    }
  }

  if (errors.length > 0) {
    return { ok: false, accepted_result: null, errors };
  }

  if (!input.server_context.allowed_player_ids || !input.server_context.allowed_player_ids.includes(input.submitted_by)) {
    errors.push(createContractError("UNAUTHORIZED_SUBMITTER", "submitted_by is not part of this match", "submitted_by"));
  }

  if (input.server_context.match_status !== "completed") {
    errors.push(createContractError("MATCH_NOT_COMPLETED", "Match status must be completed", "server_context.match_status"));
  }

  if (input.server_context.match_phase !== "result_preview") {
    errors.push(createContractError("INVALID_MATCH_PHASE", "Match phase must be result_preview", "server_context.match_phase"));
  }

  const result = input.client_result_preview;
  if (!result || typeof result.is_draw !== "boolean" || !result.reason || !result.score || !result.score.player_a || !result.score.player_b) {
    errors.push(createContractError("INVALID_RESULT_PREVIEW", "client_result_preview shape is invalid", "client_result_preview"));
  }

  if (errors.length > 0) {
    return { ok: false, accepted_result: null, errors };
  }

  const accepted_result = JSON.parse(JSON.stringify(input.client_result_preview));
  accepted_result.match_id = input.match_id;

  return {
    ok: true,
    accepted_result,
    errors: []
  };
}
