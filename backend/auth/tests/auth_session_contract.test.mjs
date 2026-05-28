import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { validateRequestSession, validateMatchParticipation } from "../auth_session_contract.mjs";

const projectRoot = process.cwd();

test("Auth / Session Contract tests", async (t) => {
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "auth_session.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "auth_session.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  // --- validateRequestSession ---

  await t.test("valid active session passes", () => {
    const res = validateRequestSession(valid.valid_active_session);
    assert.equal(res.ok, true);
    assert.ok(res.session_context);
    assert.equal(res.session_context.session_id, "sess_001");
    assert.equal(res.session_context.player_id, "player_a");
    assert.equal(res.session_context.status, "active");
    assert.equal(res.errors.length, 0);
  });

  await t.test("unknown session fails", () => {
    const res = validateRequestSession(invalid.unknown_session);
    assert.equal(res.ok, false);
    assert.equal(res.session_context, null);
    assert.ok(res.errors.some(e => e.code === "UNKNOWN_SESSION"));
  });

  await t.test("session player mismatch fails", () => {
    const res = validateRequestSession(invalid.session_player_mismatch);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "SESSION_PLAYER_MISMATCH"));
  });

  await t.test("inactive session fails", () => {
    const res = validateRequestSession(invalid.inactive_session);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "INACTIVE_SESSION"));
  });

  await t.test("missing request_id fails", () => {
    const res = validateRequestSession(invalid.missing_request_id);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_REQUEST_ID"));
  });

  await t.test("missing session fails", () => {
    const res = validateRequestSession(invalid.missing_session);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_SESSION"));
  });

  await t.test("missing server_context fails", () => {
    const res = validateRequestSession(invalid.missing_server_context);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_SERVER_CONTEXT"));
  });

  await t.test("missing session_id fails", () => {
    const res = validateRequestSession(invalid.missing_session_id);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_SESSION_ID"));
  });

  await t.test("missing player_id fails", () => {
    const res = validateRequestSession(invalid.missing_player_id);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_PLAYER_ID"));
  });

  // --- validateMatchParticipation ---

  await t.test("valid match participation completed passes", () => {
    const res = validateMatchParticipation(valid.valid_match_participation_completed);
    assert.equal(res.ok, true);
    assert.ok(res.participation_context);
    assert.equal(res.participation_context.match_id, "local_match_001");
    assert.equal(res.participation_context.player_id, "player_a");
    assert.equal(res.participation_context.match_status, "completed");
    assert.equal(res.errors.length, 0);
  });

  await t.test("valid match participation active passes", () => {
    const res = validateMatchParticipation(valid.valid_match_participation_active);
    assert.equal(res.ok, true);
    assert.equal(res.participation_context.match_status, "active");
    assert.equal(res.participation_context.player_id, "player_b");
  });

  await t.test("player not in match fails", () => {
    const res = validateMatchParticipation(invalid.player_not_in_match);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "PLAYER_NOT_IN_MATCH"));
  });

  await t.test("invalid match status fails", () => {
    const res = validateMatchParticipation(invalid.invalid_match_status);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "INVALID_MATCH_STATUS"));
  });

  await t.test("missing match_context fails", () => {
    const res = validateMatchParticipation(invalid.missing_match_context);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_MATCH_CONTEXT"));
  });

  await t.test("missing match_id fails", () => {
    const res = validateMatchParticipation(invalid.missing_match_id);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_MATCH_ID"));
  });

  // --- Immutability ---

  await t.test("validateRequestSession does not mutate input", () => {
    const input = JSON.parse(JSON.stringify(valid.valid_active_session));
    const snapshot = JSON.stringify(input);
    validateRequestSession(input);
    assert.equal(JSON.stringify(input), snapshot);
  });

  await t.test("validateMatchParticipation does not mutate input", () => {
    const input = JSON.parse(JSON.stringify(valid.valid_match_participation_completed));
    const snapshot = JSON.stringify(input);
    validateMatchParticipation(input);
    assert.equal(JSON.stringify(input), snapshot);
  });
});
