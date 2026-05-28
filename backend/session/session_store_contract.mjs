import { createSessionStoreError } from "./session_store_errors.mjs";

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function hasSessionStoreMethods(sessionStore) {
  return sessionStore
    && typeof sessionStore.getSession === "function"
    && typeof sessionStore.saveSession === "function"
    && typeof sessionStore.revokeSession === "function"
    && typeof sessionStore.listSessionsByPlayer === "function";
}

function invalidResult(code, message, path) {
  return {
    ok: false,
    session_context: null,
    session: null,
    errors: [createSessionStoreError(code, message, path)]
  };
}

export function validateSessionFromStore(input, sessionStore) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return invalidResult("INVALID_SESSION_STORE_INPUT", "Input must be a non-null object", "input");
  }

  if (!input.request_id) {
    errors.push(createSessionStoreError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.session) {
    errors.push(createSessionStoreError("MISSING_SESSION", "session is required", "session"));
  }
  if (!hasSessionStoreMethods(sessionStore)) {
    errors.push(createSessionStoreError("MISSING_SESSION_STORE", "sessionStore is required", "sessionStore"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  if (!input.session.session_id) {
    errors.push(createSessionStoreError("MISSING_SESSION_ID", "session.session_id is required", "session.session_id"));
  }
  if (!input.session.player_id) {
    errors.push(createSessionStoreError("MISSING_PLAYER_ID", "session.player_id is required", "session.player_id"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  const stored = sessionStore.getSession(input.session.session_id);

  if (!stored) {
    return {
      ok: false,
      session_context: null,
      errors: [createSessionStoreError("UNKNOWN_SESSION", "Session is not known by session store", "session.session_id")]
    };
  }

  if (stored.player_id !== input.session.player_id) {
    errors.push(createSessionStoreError("SESSION_PLAYER_MISMATCH", "Session player_id does not match stored record", "session.player_id"));
  }

  if (stored.status !== "active") {
    errors.push(createSessionStoreError("INACTIVE_SESSION", "Stored session status is not active", "session.status"));
  }

  if (errors.length > 0) {
    return { ok: false, session_context: null, errors };
  }

  return {
    ok: true,
    session_context: {
      request_id: input.request_id,
      session_id: stored.session_id,
      player_id: stored.player_id,
      status: "active"
    },
    errors: []
  };
}

export function revokeSessionInStore(input, sessionStore) {
  const errors = [];

  if (!input || typeof input !== "object") {
    return invalidResult("INVALID_SESSION_STORE_INPUT", "Input must be a non-null object", "input");
  }

  if (!input.request_id) {
    errors.push(createSessionStoreError("MISSING_REQUEST_ID", "request_id is required", "request_id"));
  }
  if (!input.session_id) {
    errors.push(createSessionStoreError("MISSING_SESSION_ID", "session_id is required", "session_id"));
  }
  if (!hasSessionStoreMethods(sessionStore)) {
    errors.push(createSessionStoreError("MISSING_SESSION_STORE", "sessionStore is required", "sessionStore"));
  }

  if (errors.length > 0) {
    return { ok: false, session: null, errors };
  }

  const revoked = sessionStore.revokeSession(input.session_id, input.reason || "REVOKED");

  if (!revoked) {
    return {
      ok: false,
      session: null,
      errors: [createSessionStoreError("REVOKE_SESSION_FAILED", "Session could not be revoked", "session_id")]
    };
  }

  return {
    ok: true,
    session: clone(revoked),
    errors: []
  };
}
