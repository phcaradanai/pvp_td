import { createMatchStoreError } from "./match_store_errors.mjs";

const VALID_STATUSES = ["pending", "active", "completed", "cancelled"];

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function hasMatchStoreMethods(matchStore) {
  return matchStore
    && typeof matchStore.getMatch === "function"
    && typeof matchStore.saveMatch === "function"
    && typeof matchStore.updateMatchStatus === "function"
    && typeof matchStore.saveMatchResult === "function"
    && typeof matchStore.listMatchesByPlayer === "function";
}

function invalidResult(code, message, path) {
  return {
    ok: false,
    errors: [createMatchStoreError(code, message, path)]
  };
}

export function validateMatchFromStore(input, matchStore) {
  if (!input || typeof input !== "object") {
    return invalidResult("INVALID_MATCH_STORE_INPUT", "Input must be a non-null object", "input");
  }

  const errors = [];

  if (!input.request_id) {
    errors.push(createMatchStoreError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.match_id) {
    errors.push(createMatchStoreError("MISSING_MATCH_ID", "match_id is required", "match_id"));
  }
  if (!hasMatchStoreMethods(matchStore)) {
    errors.push(createMatchStoreError("MISSING_MATCH_STORE", "matchStore is required", "matchStore"));
  }

  if (errors.length > 0) {
    return { ok: false, match_context: null, errors };
  }

  const match = matchStore.getMatch(input.match_id);

  if (!match) {
    return invalidResult("UNKNOWN_MATCH", "Match not found in store", "match_id");
  }

  return {
    ok: true,
    match_context: {
      request_id: input.request_id,
      match_id: match.match_id,
      allowed_player_ids: clone(match.allowed_player_ids),
      status: match.status,
      phase: match.phase || null
    },
    errors: []
  };
}

export function validateMatchParticipationFromStore(input, matchStore) {
  if (!input || typeof input !== "object") {
    return invalidResult("INVALID_MATCH_STORE_INPUT", "Input must be a non-null object", "input");
  }

  const errors = [];

  if (!input.request_id) {
    errors.push(createMatchStoreError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.session_context) {
    errors.push(createMatchStoreError("MISSING_SESSION_CONTEXT", "session_context is required", "session_context"));
  }
  if (input.session_context && !input.session_context.player_id) {
    errors.push(createMatchStoreError("MISSING_PLAYER_ID", "session_context.player_id is required", "session_context.player_id"));
  }
  if (!input.match_id) {
    errors.push(createMatchStoreError("MISSING_MATCH_ID", "match_id is required", "match_id"));
  }
  if (!hasMatchStoreMethods(matchStore)) {
    errors.push(createMatchStoreError("MISSING_MATCH_STORE", "matchStore is required", "matchStore"));
  }

  if (errors.length > 0) {
    return { ok: false, participation_context: null, errors };
  }

  const match = matchStore.getMatch(input.match_id);

  if (!match) {
    return { ok: false, participation_context: null, errors: [createMatchStoreError("UNKNOWN_MATCH", "Match not found in store", "match_id")] };
  }

  const player_id = input.session_context.player_id;
  const allowedIds = Array.isArray(match.allowed_player_ids) ? match.allowed_player_ids : [];

  if (!allowedIds.includes(player_id)) {
    return { ok: false, participation_context: null, errors: [createMatchStoreError("PLAYER_NOT_IN_MATCH", "Player is not a participant in this match", "session_context.player_id")] };
  }

  if (!VALID_STATUSES.includes(match.status)) {
    return { ok: false, participation_context: null, errors: [createMatchStoreError("INVALID_MATCH_STATUS", `match status must be one of: ${VALID_STATUSES.join(", ")}`, "match.status")] };
  }

  return {
    ok: true,
    participation_context: {
      request_id: input.request_id,
      match_id: match.match_id,
      player_id,
      match_status: match.status,
      match_phase: match.phase || null
    },
    errors: []
  };
}

export function updateMatchStatusInStore(input, matchStore) {
  if (!input || typeof input !== "object") {
    return invalidResult("INVALID_MATCH_STORE_INPUT", "Input must be a non-null object", "input");
  }

  const errors = [];

  if (!input.request_id) {
    errors.push(createMatchStoreError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.match_id) {
    errors.push(createMatchStoreError("MISSING_MATCH_ID", "match_id is required", "match_id"));
  }
  if (!input.status || !VALID_STATUSES.includes(input.status)) {
    errors.push(createMatchStoreError("INVALID_MATCH_STATUS", `status must be one of: ${VALID_STATUSES.join(", ")}`, "status"));
  }
  if (!hasMatchStoreMethods(matchStore)) {
    errors.push(createMatchStoreError("MISSING_MATCH_STORE", "matchStore is required", "matchStore"));
  }

  if (errors.length > 0) {
    return { ok: false, match: null, errors };
  }

  const updateResult = matchStore.updateMatchStatus(input.match_id, input.status);

  if (!updateResult.ok) {
    return {
      ok: false,
      match: null,
      errors: [createMatchStoreError("UPDATE_MATCH_STATUS_FAILED", "Failed to update match status", "match_id", updateResult.errors)]
    };
  }

  return {
    ok: true,
    match: updateResult.match,
    errors: []
  };
}
