import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { 
  handleHealthCheck, 
  handleValidateMatchResult, 
  handleRewardClaimPreview 
} from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

test("Backend API Skeleton tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validDataRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api.valid.sample.json"), "utf8");
  const invalidDataRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api.invalid.sample.json"), "utf8");
  const validData = JSON.parse(validDataRaw);
  const invalidData = JSON.parse(invalidDataRaw);

  await t.test("health check returns 200", () => {
    const res = handleHealthCheck();
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.service, "pvp-td-backend-api");
  });

  await t.test("valid match result validation returns 200", () => {
    const req = validData.valid_match_result_request.request;
    const res = handleValidateMatchResult(req, catalog);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.accepted_result);
  });

  await t.test("invalid match result validation returns 400", () => {
    const req = invalidData.invalid_match_result_request.request;
    const res = handleValidateMatchResult(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.errors.length > 0);
  });

  await t.test("unauthorized submitter returns 400", () => {
    const req = invalidData.unauthorized_submitter_request.request;
    const res = handleValidateMatchResult(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
  });

  await t.test("client-submitted rewards return 400", () => {
    const req = invalidData.client_reward_not_allowed_request.request;
    const res = handleValidateMatchResult(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    const hasRewardError = res.body.errors.some(e => e.code === "CLIENT_REWARD_NOT_ALLOWED");
    assert.ok(hasRewardError);
  });

  await t.test("missing request body for match result returns 400", () => {
    const req = invalidData.missing_match_result_body.request;
    const res = handleValidateMatchResult(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.errors[0].code, "MISSING_REQUEST_BODY");
  });

  await t.test("valid reward claim preview returns 200", () => {
    const req = validData.valid_reward_claim_preview_request.request;
    const res = handleRewardClaimPreview(req, catalog);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.claim_preview);
  });

  await t.test("invalid reward claim preview returns 400", () => {
    const req = invalidData.invalid_reward_claim_request.request;
    const res = handleRewardClaimPreview(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.errors.length > 0);
  });

  await t.test("missing request body for reward claim returns 400", () => {
    const req = invalidData.missing_reward_claim_body.request;
    const res = handleRewardClaimPreview(req, catalog);
    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.errors[0].code, "MISSING_REQUEST_BODY");
  });

  await t.test("route metadata includes all expected routes", () => {
    assert.ok(routeMetadata.routes);
    assert.equal(routeMetadata.routes.length, 21);
    const paths = routeMetadata.routes.map(r => r.path);
    assert.ok(paths.includes("/health"));
    assert.ok(paths.includes("/match-results/validate"));
    assert.ok(paths.includes("/reward-claims/preview"));
    assert.ok(paths.includes("/protected/match-results/validate"));
    assert.ok(paths.includes("/protected/reward-claims/preview"));
    assert.ok(paths.includes("/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/protected/reward-claims/preview-and-persist"));
    assert.ok(paths.includes("/idempotent/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/idempotent/protected/reward-claims/preview-and-persist"));
    assert.ok(paths.includes("/store/protected/match-results/validate"));
    assert.ok(paths.includes("/store/protected/reward-claims/preview"));
    assert.ok(paths.includes("/store/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store/protected/reward-claims/preview-and-persist"));
    assert.ok(paths.includes("/store/idempotent/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store/idempotent/protected/reward-claims/preview-and-persist"));
  });

  await t.test("handlers do not mutate input", () => {
    const req = validData.valid_match_result_request.request;
    const inputStr = JSON.stringify(req);
    handleValidateMatchResult(req, catalog);
    assert.equal(JSON.stringify(req), inputStr);
    
    const reqReward = validData.valid_reward_claim_preview_request.request;
    const inputStrReward = JSON.stringify(reqReward);
    handleRewardClaimPreview(reqReward, catalog);
    assert.equal(JSON.stringify(reqReward), inputStrReward);
  });
});
