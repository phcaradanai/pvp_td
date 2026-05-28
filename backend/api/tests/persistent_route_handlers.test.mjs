import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import {
  handleProtectedValidateAndPersistMatchResult,
  handleProtectedRewardClaimPreviewAndPersist
} from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { ERROR_CODES } from "../api_errors.mjs";
import { createInMemoryRepositories } from "../../persistence/in_memory_repositories.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createRepositories(valid) {
  return createInMemoryRepositories(valid.valid_repository_seed);
}

function assertNoMatchResultPersisted(repositories, matchId = "local_match_001") {
  const match = repositories.matches.getMatch(matchId);
  if (match) assert.equal(match.result, undefined);
}

test("Persistent protected route handler tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_persistence.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_persistence.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("valid protected match result persists and returns 200", () => {
    const repositories = createRepositories(valid);
    const request = clone(valid.valid_protected_match_result_persist_request.request);
    const res = handleProtectedValidateAndPersistMatchResult(request, catalog, repositories);

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.deepEqual(res.body.persisted_result, res.body.accepted_result);
  });

  await t.test("valid protected reward claim persists and returns 200", () => {
    const repositories = createRepositories(valid);
    const request = clone(valid.valid_protected_reward_claim_persist_request.request);
    const res = handleProtectedRewardClaimPreviewAndPersist(request, catalog, repositories);

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.claim_preview);
    assert.equal(res.body.persisted_claim.claim_id, "claim_req_persist_reward_001");
  });

  await t.test("persisted match result can be read from repository", () => {
    const repositories = createRepositories(valid);
    const request = clone(valid.valid_protected_match_result_persist_request.request);
    const res = handleProtectedValidateAndPersistMatchResult(request, catalog, repositories);
    const match = repositories.matches.getMatch("local_match_001");

    assert.equal(res.status, 200);
    assert.deepEqual(match.result, res.body.persisted_result);
  });

  await t.test("persisted reward claim can be read from repository", () => {
    const repositories = createRepositories(valid);
    const request = clone(valid.valid_protected_reward_claim_persist_request.request);
    const res = handleProtectedRewardClaimPreviewAndPersist(request, catalog, repositories);
    const claim = repositories.reward_claims.getRewardClaim("claim_req_persist_reward_001");

    assert.equal(res.status, 200);
    assert.deepEqual(claim, res.body.persisted_claim);
  });

  await t.test("missing repositories returns failure", () => {
    const request = clone(valid.valid_protected_match_result_persist_request.request);
    const res = handleProtectedValidateAndPersistMatchResult(request, catalog, invalid.missing_repositories.repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MISSING_REPOSITORIES));
  });

  await t.test("match not found returns failure", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedValidateAndPersistMatchResult(invalid.match_not_found.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.PERSIST_MATCH_RESULT_FAILED));
    assert.ok(res.body.errors[0].details.some(e => e.code === "MATCH_NOT_FOUND"));
  });

  await t.test("auth failure does not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedValidateAndPersistMatchResult(invalid.auth_failed_no_persist.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.AUTH_SESSION_FAILED));
    assertNoMatchResultPersisted(repositories);
  });

  await t.test("participation failure does not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedValidateAndPersistMatchResult(invalid.participation_failed_no_persist.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MATCH_PARTICIPATION_FAILED));
    assertNoMatchResultPersisted(repositories);
  });

  await t.test("contract failure does not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedValidateAndPersistMatchResult(invalid.contract_failed_no_persist.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === "INVALID_RESULT_PREVIEW"));
    assertNoMatchResultPersisted(repositories);
  });

  await t.test("client-submitted rewards still fail and do not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedValidateAndPersistMatchResult(invalid.client_reward_not_allowed_no_persist.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === "CLIENT_REWARD_NOT_ALLOWED"));
    assertNoMatchResultPersisted(repositories);
  });

  await t.test("reward contract failure does not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleProtectedRewardClaimPreviewAndPersist(invalid.missing_claim_preview.request, catalog, repositories);

    assert.equal(res.status, 400);
    assert.equal(repositories.reward_claims.getRewardClaim("claim_req_persist_reward_contract_fail"), null);
  });

  await t.test("protected persistence route metadata exists", () => {
    const matchRoute = routeMetadata.routes.find(r => r.handler === "handleProtectedValidateAndPersistMatchResult");
    assert.ok(matchRoute);
    assert.equal(matchRoute.method, "POST");
    assert.equal(matchRoute.path, "/protected/match-results/validate-and-persist");

    const rewardRoute = routeMetadata.routes.find(r => r.handler === "handleProtectedRewardClaimPreviewAndPersist");
    assert.ok(rewardRoute);
    assert.equal(rewardRoute.method, "POST");
    assert.equal(rewardRoute.path, "/protected/reward-claims/preview-and-persist");
  });

  await t.test("persistent handlers do not mutate input", () => {
    const repositories = createRepositories(valid);
    const matchInput = clone(valid.valid_protected_match_result_persist_request.request);
    const matchSnapshot = JSON.stringify(matchInput);
    handleProtectedValidateAndPersistMatchResult(matchInput, catalog, repositories);
    assert.equal(JSON.stringify(matchInput), matchSnapshot);

    const rewardInput = clone(valid.valid_protected_reward_claim_persist_request.request);
    const rewardSnapshot = JSON.stringify(rewardInput);
    handleProtectedRewardClaimPreviewAndPersist(rewardInput, catalog, repositories);
    assert.equal(JSON.stringify(rewardInput), rewardSnapshot);
  });

  await t.test("repository clone prevents mutation leak through API response", () => {
    const repositories = createRepositories(valid);
    const request = clone(valid.valid_protected_match_result_persist_request.request);
    const res = handleProtectedValidateAndPersistMatchResult(request, catalog, repositories);

    res.body.persisted_result.score.player_a.core_hp = -999;
    const match = repositories.matches.getMatch("local_match_001");
    assert.equal(match.result.score.player_a.core_hp, 100);
  });
});
