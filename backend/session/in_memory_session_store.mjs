function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function createStoreError(code, message, path) {
  return { ok: false, session: null, errors: [{ code, message, path, details: [] }] };
}

function validateSession(session) {
  if (!session || typeof session !== "object") {
    return createStoreError("INVALID_SESSION", "Session must be a non-null object", "session");
  }
  if (!session.session_id) {
    return createStoreError("MISSING_SESSION_ID", "session_id is required", "session.session_id");
  }
  if (!session.player_id) {
    return createStoreError("MISSING_PLAYER_ID", "player_id is required", "session.player_id");
  }
  if (!session.status) {
    return createStoreError("INVALID_SESSION", "status is required", "session.status");
  }
  return { ok: true, session: clone(session), errors: [] };
}

export function createInMemorySessionStore(seed = {}) {
  const sessions = new Map();

  for (const [key, session] of Object.entries(seed || {})) {
    sessions.set(key, clone(session));
  }

  return {
    getSession(session_id) {
      return sessions.has(session_id) ? clone(sessions.get(session_id)) : null;
    },

    saveSession(session) {
      const validation = validateSession(session);
      if (!validation.ok) return validation;

      const saved = clone(validation.session);
      sessions.set(saved.session_id, saved);
      return clone(saved);
    },

    revokeSession(session_id, reason = "REVOKED") {
      if (!sessions.has(session_id)) return null;

      const current = sessions.get(session_id);
      const revoked = {
        ...clone(current),
        status: "revoked",
        updated_at: current.updated_at,
        revoked_reason: reason
      };
      sessions.set(session_id, revoked);
      return clone(revoked);
    },

    listSessionsByPlayer(player_id) {
      return Array.from(sessions.values())
        .filter(session => session.player_id === player_id)
        .sort((a, b) => a.session_id.localeCompare(b.session_id))
        .map(session => clone(session));
    }
  };
}
