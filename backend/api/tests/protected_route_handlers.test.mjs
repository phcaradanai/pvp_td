import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { handleProtectedValidateMatchResult, handleProtectedRewardClaimPreview } from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { ERROR_CODES } from "../api_errors.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

test("Protected Route Handlers tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_auth.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_auth.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("protected route metadata exists", () => {
    const matchRoute = routeMetadata.routes.find(r => r.handler === "handleProtectedValidateMatchResult");
    assert.ok(matchRoute);
    assert.equal(matchRoute.method, "POST");
    assert.equal(matchRoute.path, "/protected/match-results/validate");

    const rewardRoute = routeMetadata.routes.find(r => r.handler === "handleProtectedRewardClaimPreview");
    assert.ok(rewardRoute);
    assert.equal(rewardRoute.method, "POST");
    assert.equal(rewardRoute.path, "/protected/reward-claims/preview");
  });

  await t.test("valid protected match result returns 200", () => {
    const res = handleProtectedValidateMatchResult(valid.valid_protected_match_result_request.request, catalog);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.accepted_result);
  });

  await t.test("valid protected reward claim returns 200", () => {
    const res = handleProtectedRewardClaimPreview(valid.valid_protected_reward_claim_request.request, catalog);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.claim_preview);
  });

  await t.test("missing body returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.missing_body.request, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MISSING_REQUEST_BODY));
  });

  await t.test("unknown session returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.unknown_session.request, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.AUTH_SESSION_FAILED));
  });

  await t.test("session player mismatch returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.session_player_mismatch.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.AUTH_SESSION_FAILED));
  });

  await t.test("inactive session returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.inactive_session.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.AUTH_SESSION_FAILED));
  });

  await t.test("player not in match returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.player_not_in_match.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MATCH_PARTICIPATION_FAILED));
  });

  await t.test("invalid match status returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.invalid_match_status.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MATCH_PARTICIPATION_FAILED));
  });

  await t.test("missing result_context returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.missing_result_context.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MISSING_RESULT_CONTEXT));
  });

  await t.test("invalid result preview returns 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.invalid_result_preview.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === "INVALID_RESULT_PREVIEW"));
  });

  await t.test("client-submitted rewards still return 400", () => {
    const res = handleProtectedValidateMatchResult(invalid.client_reward_not_allowed.request, catalog);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === "CLIENT_REWARD_NOT_ALLOWED"));
  });

  await t.test("protected handlers do not mutate input", () => {
    const input = JSON.parse(JSON.stringify(valid.valid_protected_match_result_request.request));
    const snapshot = JSON.stringify(input);
    handleProtectedValidateMatchResult(input, catalog);
    assert.equal(JSON.stringify(input), snapshot);

    const inputReward = JSON.parse(JSON.stringify(valid.valid_protected_reward_claim_request.request));
    const snapshotReward = JSON.stringify(inputReward);
    handleProtectedRewardClaimPreview(inputReward, catalog);
    assert.equal(JSON.stringify(inputReward), snapshotReward);
  });
});
