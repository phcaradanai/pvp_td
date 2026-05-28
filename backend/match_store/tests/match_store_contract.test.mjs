import { test } from "node:test";
import assert from "node:assert/strict";

import { createInMemoryMatchStore } from "../in_memory_match_store.mjs";
import {
  validateMatchFromStore,
  validateMatchParticipationFromStore,
  updateMatchStatusInStore
} from "../match_store_contract.mjs";

const VALID_MATCH = {
  match_id: "local_match_001",
  allowed_player_ids: ["player_a", "player_b"],
  status: "completed",
  phase: "result_preview",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  result: null
};

const VALID_SEED = { local_match_001: VALID_MATCH };

// ─── In-memory store basic operations ───────────────────────────────────────

test("in-memory store saves and gets match", () => {
  const store = createInMemoryMatchStore();
  const saveResult = store.saveMatch(VALID_MATCH);
  assert.equal(saveResult.ok, true);
  assert.equal(saveResult.match.match_id, "local_match_001");

  const got = store.getMatch("local_match_001");
  assert.ok(got);
  assert.equal(got.match_id, "local_match_001");
  assert.equal(got.status, "completed");
});

test("missing match returns null", () => {
  const store = createInMemoryMatchStore();
  const got = store.getMatch("no_such_match");
  assert.equal(got, null);
});

test("listMatchesByPlayer returns deterministic order", () => {
  const store = createInMemoryMatchStore({
    local_match_002: {
      match_id: "local_match_002",
      allowed_player_ids: ["player_a", "player_c"],
      status: "active",
      phase: "battle_preview",
      created_at: "2026-01-02T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
      result: null
    },
    local_match_001: VALID_MATCH
  });

  const list = store.listMatchesByPlayer("player_a");
  assert.equal(list.length, 2);
  assert.equal(list[0].match_id, "local_match_001");
  assert.equal(list[1].match_id, "local_match_002");
});

test("store clone prevents mutation leak", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const got = store.getMatch("local_match_001");
  got.status = "cancelled";
  got.allowed_player_ids.push("player_z");

  const got2 = store.getMatch("local_match_001");
  assert.equal(got2.status, "completed");
  assert.equal(got2.allowed_player_ids.length, 2);
});

test("saveMatchResult stores result", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = { winner: "player_a", is_draw: false };
  const saveResult = store.saveMatchResult("local_match_001", result);
  assert.equal(saveResult.ok, true);

  const got = store.getMatch("local_match_001");
  assert.deepEqual(got.result, { winner: "player_a", is_draw: false });
});

// ─── validateMatchFromStore ──────────────────────────────────────────────────

test("valid match from store passes", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchFromStore({ request_id: "req_001", match_id: "local_match_001" }, store);
  assert.equal(result.ok, true);
  assert.ok(result.match_context);
  assert.equal(result.match_context.match_id, "local_match_001");
  assert.equal(result.match_context.request_id, "req_001");
  assert.deepEqual(result.match_context.allowed_player_ids, ["player_a", "player_b"]);
  assert.equal(result.match_context.status, "completed");
  assert.equal(result.match_context.phase, "result_preview");
});

test("unknown match fails", () => {
  const store = createInMemoryMatchStore();
  const result = validateMatchFromStore({ request_id: "req_001", match_id: "no_such_match" }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "UNKNOWN_MATCH"));
});

test("missing request_id fails in validateMatchFromStore", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchFromStore({ match_id: "local_match_001" }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "MISSING_REQUEST_ID"));
});

test("missing match_id fails in validateMatchFromStore", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchFromStore({ request_id: "req_001" }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "MISSING_MATCH_ID"));
});

test("missing matchStore fails in validateMatchFromStore", () => {
  const result = validateMatchFromStore({ request_id: "req_001", match_id: "local_match_001" }, null);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "MISSING_MATCH_STORE"));
});

// ─── validateMatchParticipationFromStore ────────────────────────────────────

test("valid match participation from store passes", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchParticipationFromStore({
    request_id: "req_001",
    session_context: { session_id: "sess_001", player_id: "player_a", status: "active" },
    match_id: "local_match_001"
  }, store);
  assert.equal(result.ok, true);
  assert.ok(result.participation_context);
  assert.equal(result.participation_context.player_id, "player_a");
  assert.equal(result.participation_context.match_id, "local_match_001");
  assert.equal(result.participation_context.match_status, "completed");
  assert.equal(result.participation_context.match_phase, "result_preview");
});

test("player not in match fails", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchParticipationFromStore({
    request_id: "req_001",
    session_context: { session_id: "sess_999", player_id: "player_z", status: "active" },
    match_id: "local_match_001"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "PLAYER_NOT_IN_MATCH"));
});

test("invalid match status fails in validateMatchParticipationFromStore", () => {
  const store = createInMemoryMatchStore({
    bad_match: {
      match_id: "bad_match",
      allowed_player_ids: ["player_a"],
      status: "NOT_VALID",
      phase: "planning",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      result: null
    }
  });
  const result = validateMatchParticipationFromStore({
    request_id: "req_001",
    session_context: { session_id: "sess_001", player_id: "player_a", status: "active" },
    match_id: "bad_match"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "INVALID_MATCH_STATUS"));
});

test("missing session_context fails", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchParticipationFromStore({
    request_id: "req_001",
    match_id: "local_match_001"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "MISSING_SESSION_CONTEXT"));
});

test("missing player_id fails", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = validateMatchParticipationFromStore({
    request_id: "req_001",
    session_context: { session_id: "sess_001", status: "active" },
    match_id: "local_match_001"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "MISSING_PLAYER_ID"));
});

// ─── updateMatchStatusInStore ────────────────────────────────────────────────

test("update match status succeeds", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = updateMatchStatusInStore({
    request_id: "req_status_001",
    match_id: "local_match_001",
    status: "cancelled"
  }, store);
  assert.equal(result.ok, true);
  assert.ok(result.match);
  assert.equal(result.match.status, "cancelled");
});

test("update unknown match fails", () => {
  const store = createInMemoryMatchStore();
  const result = updateMatchStatusInStore({
    request_id: "req_status_001",
    match_id: "no_such_match",
    status: "completed"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "UPDATE_MATCH_STATUS_FAILED"));
});

test("update with invalid status fails", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const result = updateMatchStatusInStore({
    request_id: "req_status_001",
    match_id: "local_match_001",
    status: "invalid_status"
  }, store);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "INVALID_MATCH_STATUS"));
});

// ─── Mutation safety ─────────────────────────────────────────────────────────

test("validateMatchFromStore does not mutate input", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const input = { request_id: "req_001", match_id: "local_match_001" };
  const frozen = JSON.parse(JSON.stringify(input));
  validateMatchFromStore(input, store);
  assert.deepEqual(input, frozen);
});

test("validateMatchParticipationFromStore does not mutate input", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const input = {
    request_id: "req_001",
    session_context: { session_id: "sess_001", player_id: "player_a", status: "active" },
    match_id: "local_match_001"
  };
  const frozen = JSON.parse(JSON.stringify(input));
  validateMatchParticipationFromStore(input, store);
  assert.deepEqual(input, frozen);
});

test("updateMatchStatusInStore does not mutate input", () => {
  const store = createInMemoryMatchStore(VALID_SEED);
  const input = { request_id: "req_status_001", match_id: "local_match_001", status: "completed" };
  const frozen = JSON.parse(JSON.stringify(input));
  updateMatchStatusInStore(input, store);
  assert.deepEqual(input, frozen);
});
