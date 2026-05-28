// auth_session_contract.mjs
import { createAuthError } from "./auth_errors.mjs";

const VALID_MATCH_STATUSES = ["pending", "active", "completed", "cancelled"];

/**
 * Validates that a request carries a valid, active session
 * according to the server_context.known_sessions lookup.
 *
 * Does NOT perform real JWT/token verification.
 * Does NOT query a database.
 */
export function validateRequestSession(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return {
      ok: false,
      session_context: null,
      errors: [createAuthError("INVALID_AUTH_SESSION_INPUT", "Input must be a non-null object", "input")]
    };
  }

  if (!input.request_id) {
    errors.push(createAuthError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.session) {
    errors.push(createAuthError("MISSING_SESSION", "session is required", "session"));
  }
  if (!input.server_context) {
    errors.push(createAuthError("MISSING_SERVER_CONTEXT", "server_context is required", "server_context"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  if (!input.session.session_id) {
    errors.push(createAuthError("MISSING_SESSION_ID", "session.session_id is required", "session.session_id"));
  }
  if (!input.session.player_id) {
    errors.push(createAuthError("MISSING_PLAYER_ID", "session.player_id is required", "session.player_id"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  const knownSessions = input.server_context.known_sessions || {};
  const knownEntry = knownSessions[input.session.session_id];

  if (!knownEntry) {
    errors.push(createAuthError("UNKNOWN_SESSION", "Session is not known by server context", "session.session_id"));
    return { ok: false, session_context: null, errors };
  }

  if (knownEntry.player_id !== input.session.player_id) {
    errors.push(createAuthError("SESSION_PLAYER_MISMATCH", "Session player_id does not match server record", "session.player_id"));
  }

  if (knownEntry.status !== "active") {
    errors.push(createAuthError("INACTIVE_SESSION", "Session status is not active", "session.status"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  return {
    ok: true,
    session_context: {
      request_id: input.request_id,
      session_id: input.session.session_id,
      player_id: input.session.player_id,
      status: "active"
    },
    errors: []
  };
}

/**
 * Validates that an already-authenticated session_context
 * is a valid participant of the given match_context.
 *
 * Does NOT query a database.
 * Does NOT perform real matchmaking.
 */
export function validateMatchParticipation(input) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return {
      ok: false,
      participation_context: null,
      errors: [createAuthError("INVALID_MATCH_PARTICIPATION_INPUT", "Input must be a non-null object", "input")]
    };
  }

  if (!input.request_id) {
    errors.push(createAuthError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.session_context) {
    errors.push(createAuthError("MISSING_SESSION_CONTEXT", "session_context is required", "session_context"));
  }
  if (!input.match_context) {
    errors.push(createAuthError("MISSING_MATCH_CONTEXT", "match_context is required", "match_context"));
  }

  if (errors.length > 0) {
    return { ok: false, participation_context: null, errors };
  }

  if (!input.match_context.match_id) {
    errors.push(createAuthError("MISSING_MATCH_ID", "match_context.match_id is required", "match_context.match_id"));
  }

  if (!VALID_MATCH_STATUSES.includes(input.match_context.status)) {
    errors.push(createAuthError("INVALID_MATCH_STATUS", `match_context.status must be one of: ${VALID_MATCH_STATUSES.join(", ")}`, "match_context.status"));
  }

  const allowedIds = input.match_context.allowed_player_ids || [];
  if (!allowedIds.includes(input.session_context.player_id)) {
    errors.push(createAuthError("PLAYER_NOT_IN_MATCH", "Player is not a participant in this match", "session_context.player_id"));
  }

  if (errors.length > 0) {
    return { ok: false, participation_context: null, errors };
  }

  return {
    ok: true,
    participation_context: {
      request_id: input.request_id,
      match_id: input.match_context.match_id,
      player_id: input.session_context.player_id,
      match_status: input.match_context.status
    },
    errors: []
  };
}
