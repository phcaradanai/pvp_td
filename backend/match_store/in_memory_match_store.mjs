import { createMatchStoreError } from "./match_store_errors.mjs";

const VALID_STATUSES = ["pending", "active", "completed", "cancelled"];

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function validateMatchShape(match) {
  if (!match || typeof match !== "object") {
    return createMatchStoreError("INVALID_MATCH", "match must be a non-null object", "match");
  }
  if (!match.match_id) {
    return createMatchStoreError("INVALID_MATCH", "match_id is required", "match.match_id");
  }
  if (!Array.isArray(match.allowed_player_ids) || match.allowed_player_ids.length === 0) {
    return createMatchStoreError("INVALID_MATCH", "allowed_player_ids must be a non-empty array", "match.allowed_player_ids");
  }
  if (!VALID_STATUSES.includes(match.status)) {
    return createMatchStoreError("INVALID_MATCH_STATUS", `status must be one of: ${VALID_STATUSES.join(", ")}`, "match.status");
  }
  return null;
}

export function createInMemoryMatchStore(seed = {}) {
  const matches = new Map();

  for (const [key, match] of Object.entries(seed || {})) {
    matches.set(key, clone(match));
  }

  return {
    getMatch(match_id) {
      return matches.has(match_id) ? clone(matches.get(match_id)) : null;
    },

    saveMatch(match) {
      const validationError = validateMatchShape(match);
      if (validationError) {
        return { ok: false, match: null, errors: [validationError] };
      }

      const saved = clone(match);
      matches.set(saved.match_id, saved);
      return { ok: true, match: clone(saved), errors: [] };
    },

    updateMatchStatus(match_id, status) {
      if (!VALID_STATUSES.includes(status)) {
        return { ok: false, match: null, errors: [createMatchStoreError("INVALID_MATCH_STATUS", `status must be one of: ${VALID_STATUSES.join(", ")}`, "status")] };
      }

      if (!matches.has(match_id)) {
        return { ok: false, match: null, errors: [createMatchStoreError("UNKNOWN_MATCH", "Match not found in store", "match_id")] };
      }

      const current = matches.get(match_id);
      const updated = { ...clone(current), status };
      matches.set(match_id, updated);
      return { ok: true, match: clone(updated), errors: [] };
    },

    saveMatchResult(match_id, result) {
      if (!matches.has(match_id)) {
        return { ok: false, result: null, errors: [createMatchStoreError("UNKNOWN_MATCH", "Match not found in store", "match_id")] };
      }

      const current = matches.get(match_id);
      const updated = { ...clone(current), result: clone(result) };
      matches.set(match_id, updated);
      return { ok: true, result: clone(result), errors: [] };
    },

    listMatchesByPlayer(player_id) {
      return Array.from(matches.values())
        .filter(match => Array.isArray(match.allowed_player_ids) && match.allowed_player_ids.includes(player_id))
        .sort((a, b) => a.match_id.localeCompare(b.match_id))
        .map(match => clone(match));
    }
  };
}
