import test from "node:test";
import assert from "node:assert/strict";
import { validateMatchResultSubmission } from "../match_result_contract.mjs";
import { loadJsonFile } from "../../../tools/validation/src/load_json.mjs";
import path from "path";

const projectRoot = process.cwd();

test("MatchResultContract tests", async (t) => {
  const validPath = path.join(projectRoot, "data", "samples", "backend_contract.valid.sample.json");
  const invalidPath = path.join(projectRoot, "data", "samples", "backend_contract.invalid.sample.json");
  const validData = await loadJsonFile(validPath);
  const invalidData = await loadJsonFile(invalidPath);

  await t.test("valid draw match result submission passes", () => {
    const res = validateMatchResultSubmission(validData.valid_draw_match_result_submission);
    assert.ok(res.ok);
    assert.equal(res.accepted_result.match_id, "local_match_001");
    assert.equal(res.accepted_result.is_draw, true);
  });

  await t.test("valid Player A win match result submission passes", () => {
    const res = validateMatchResultSubmission(validData.valid_player_a_win_match_result_submission);
    assert.ok(res.ok);
    assert.equal(res.accepted_result.winner, "player_a");
  });

  await t.test("unauthorized submitter fails", () => {
    const res = validateMatchResultSubmission(invalidData.unauthorized_submitter);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "UNAUTHORIZED_SUBMITTER"));
  });

  await t.test("match not completed fails", () => {
    const res = validateMatchResultSubmission(invalidData.match_not_completed);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MATCH_NOT_COMPLETED"));
  });

  await t.test("invalid match phase fails", () => {
    const res = validateMatchResultSubmission(invalidData.invalid_match_phase);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "INVALID_MATCH_PHASE"));
  });

  await t.test("client reward fields are rejected", () => {
    const res = validateMatchResultSubmission(invalidData.client_reward_not_allowed);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "CLIENT_REWARD_NOT_ALLOWED"));
  });

  await t.test("invalid result preview fails", () => {
    const res = validateMatchResultSubmission(invalidData.invalid_result_preview);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "INVALID_RESULT_PREVIEW"));
  });

  await t.test("input is not mutated", () => {
    const input = JSON.parse(JSON.stringify(validData.valid_draw_match_result_submission));
    const inputStr = JSON.stringify(input);
    validateMatchResultSubmission(input);
    assert.equal(JSON.stringify(input), inputStr);
  });
});
