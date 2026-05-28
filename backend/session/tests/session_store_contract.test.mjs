import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { createInMemorySessionStore } from "../in_memory_session_store.mjs";
import { validateSessionFromStore, revokeSessionInStore } from "../session_store_contract.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("Session store contract tests", async (t) => {
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "session_store.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "session_store.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("in-memory store saves and gets session", () => {
    const store = createInMemorySessionStore();
    const saved = store.saveSession(valid.valid_active_session_seed.sess_001);
    const loaded = store.getSession("sess_001");

    assert.equal(saved.session_id, "sess_001");
    assert.deepEqual(loaded, saved);
  });

  await t.test("missing session returns null", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    assert.equal(store.getSession("sess_missing"), null);
  });

  await t.test("listSessionsByPlayer returns deterministic order", () => {
    const store = createInMemorySessionStore(valid.valid_multiple_sessions_seed);
    const sessions = store.listSessionsByPlayer("player_a");

    assert.deepEqual(sessions.map(session => session.session_id), ["sess_001", "sess_003", "sess_010"]);
  });

  await t.test("store clone prevents mutation leak", () => {
    const store = createInMemorySessionStore();
    const seed = clone(valid.valid_active_session_seed.sess_001);
    store.saveSession(seed);
    seed.status = "revoked";

    const loaded = store.getSession("sess_001");
    loaded.status = "expired";

    assert.equal(store.getSession("sess_001").status, "active");
  });

  await t.test("valid active session from store passes", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = validateSessionFromStore(valid.valid_validate_session_from_store, store);

    assert.equal(res.ok, true);
    assert.equal(res.session_context.request_id, "req_session_store_001");
    assert.equal(res.session_context.session_id, "sess_001");
    assert.equal(res.session_context.player_id, "player_a");
    assert.equal(res.session_context.status, "active");
  });

  await t.test("unknown session fails", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = validateSessionFromStore(invalid.unknown_session, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "UNKNOWN_SESSION"));
  });

  await t.test("session player mismatch fails", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = validateSessionFromStore(invalid.session_player_mismatch, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "SESSION_PLAYER_MISMATCH"));
  });

  await t.test("inactive session fails", () => {
    const store = createInMemorySessionStore({
      sess_inactive: {
        session_id: "sess_inactive",
        player_id: "player_a",
        status: "revoked",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        revoked_reason: "USER_LOGOUT"
      }
    });
    const res = validateSessionFromStore(invalid.inactive_session, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "INACTIVE_SESSION"));
  });

  await t.test("missing request_id fails", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = validateSessionFromStore(invalid.missing_request_id, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "MISSING_REQUEST_ID"));
  });

  await t.test("missing sessionStore fails", () => {
    const res = validateSessionFromStore(invalid.missing_session_store, null);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "MISSING_SESSION_STORE"));
  });

  await t.test("revoke active session succeeds", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = revokeSessionInStore(valid.valid_revoke_session, store);

    assert.equal(res.ok, true);
    assert.equal(res.session.status, "revoked");
    assert.equal(res.session.revoked_reason, "USER_LOGOUT");
  });

  await t.test("revoked session fails future validation", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    revokeSessionInStore(valid.valid_revoke_session, store);
    const res = validateSessionFromStore(valid.valid_validate_session_from_store, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "INACTIVE_SESSION"));
  });

  await t.test("revoke unknown session fails", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const res = revokeSessionInStore(invalid.revoke_unknown_session, store);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(error => error.code === "REVOKE_SESSION_FAILED"));
  });

  await t.test("validateSessionFromStore does not mutate input", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const input = clone(valid.valid_validate_session_from_store);
    const snapshot = JSON.stringify(input);
    validateSessionFromStore(input, store);

    assert.equal(JSON.stringify(input), snapshot);
  });

  await t.test("revokeSessionInStore does not mutate input", () => {
    const store = createInMemorySessionStore(valid.valid_active_session_seed);
    const input = clone(valid.valid_revoke_session);
    const snapshot = JSON.stringify(input);
    revokeSessionInStore(input, store);

    assert.equal(JSON.stringify(input), snapshot);
  });
});
