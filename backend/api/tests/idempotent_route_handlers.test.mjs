import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import {
  handleIdempotentProtectedValidateAndPersistMatchResult,
  handleIdempotentProtectedRewardClaimPreviewAndPersist
} from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { ERROR_CODES } from "../api_errors.mjs";
import { createInMemoryRepositories } from "../../persistence/in_memory_repositories.mjs";
import { createInMemoryIdempotencyStore } from "../../idempotency/in_memory_idempotency_store.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createRepositories(valid) {
  return createInMemoryRepositories(valid.valid_repository_seed);
}

function createIdempotencyStore(valid) {
  return createInMemoryIdempotencyStore(valid.valid_idempotency_seed);
}

function withWriteCounters(repositories) {
  const counters = {
    matchResultWrites: 0,
    rewardClaimWrites: 0
  };

  return {
    counters,
    repositories: {
      ...repositories,
      matches: {
        ...repositories.matches,
        saveMatchResult(matchId, result) {
          counters.matchResultWrites += 1;
          return repositories.matches.saveMatchResult(matchId, result);
        }
      },
      reward_claims: {
        ...repositories.reward_claims,
        saveRewardClaim(claim) {
          counters.rewardClaimWrites += 1;
          return repositories.reward_claims.saveRewardClaim(claim);
        }
      }
    }
  };
}

test("Idempotent protected route handler tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_idempotency.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_idempotency.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("valid idempotent match result persists and returns mode new", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const request = clone(valid.valid_idempotent_match_result_persist_request.request);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_match_001"));
  });

  await t.test("replay idempotent match result returns stored response and does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);

    const first = handleIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_idempotent_match_result_persist_request.request),
      catalog,
      counted.repositories,
      idempotencyStore
    );
    const replay = handleIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.replay_idempotent_match_result_persist_request.request),
      catalog,
      counted.repositories,
      idempotencyStore
    );

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.matchResultWrites, 1);
    assert.deepEqual(replay.body.accepted_result, first.body.accepted_result);
  });

  await t.test("valid idempotent reward claim persists and returns mode new", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const request = clone(valid.valid_idempotent_reward_claim_persist_request.request);
    const res = handleIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_reward_001"));
  });

  await t.test("replay idempotent reward claim returns stored response and does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);

    const first = handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_idempotent_reward_claim_persist_request.request),
      catalog,
      counted.repositories,
      idempotencyStore
    );
    const replay = handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.replay_idempotent_reward_claim_persist_request.request),
      catalog,
      counted.repositories,
      idempotencyStore
    );

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.rewardClaimWrites, 1);
    assert.deepEqual(replay.body.persisted_claim, first.body.persisted_claim);
  });

  await t.test("same idempotency key with different match result payload returns 409", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    handleIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_idempotent_match_result_persist_request.request),
      catalog,
      repositories,
      idempotencyStore
    );

    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.conflict_match_result_request.request, catalog, repositories, idempotencyStore);
    assert.equal(res.status, 409);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.IDEMPOTENCY_CHECK_FAILED));
    assert.ok(res.body.errors[0].details.some(e => e.code === "IDEMPOTENCY_CONFLICT"));
  });

  await t.test("same idempotency key with different reward claim payload returns 409", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_idempotent_reward_claim_persist_request.request),
      catalog,
      repositories,
      idempotencyStore
    );

    const res = handleIdempotentProtectedRewardClaimPreviewAndPersist(invalid.conflict_reward_claim_request.request, catalog, repositories, idempotencyStore);
    assert.equal(res.status, 409);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.IDEMPOTENCY_CHECK_FAILED));
    assert.ok(res.body.errors[0].details.some(e => e.code === "IDEMPOTENCY_CONFLICT"));
  });

  await t.test("missing idempotency_key returns 400", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.missing_idempotency_key.request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.IDEMPOTENCY_CHECK_FAILED));
  });

  await t.test("missing idempotencyStore returns 400", () => {
    const repositories = createRepositories(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(
      valid.valid_idempotent_match_result_persist_request.request,
      catalog,
      repositories,
      invalid.missing_idempotency_store.idempotencyStore
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(e => e.code === ERROR_CODES.MISSING_IDEMPOTENCY_STORE));
  });

  await t.test("auth failure does not save idempotency success", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.auth_failed_no_idempotency_save.request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_auth_fail"), null);
  });

  await t.test("contract failure does not save idempotency success", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.contract_failed_no_idempotency_save.request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_contract_fail"), null);
  });

  await t.test("persistence failure does not save idempotency success", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.persistence_failed_no_idempotency_save.request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_persist_fail"), null);
  });

  await t.test("client-submitted rewards fail and do not save idempotency success", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleIdempotentProtectedValidateAndPersistMatchResult(invalid.client_reward_not_allowed_no_idempotency_save.request, catalog, repositories, idempotencyStore);

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_client_reward"), null);
  });

  await t.test("route metadata includes idempotent routes", () => {
    const matchRoute = routeMetadata.routes.find(r => r.handler === "handleIdempotentProtectedValidateAndPersistMatchResult");
    assert.ok(matchRoute);
    assert.equal(matchRoute.method, "POST");
    assert.equal(matchRoute.path, "/idempotent/protected/match-results/validate-and-persist");

    const rewardRoute = routeMetadata.routes.find(r => r.handler === "handleIdempotentProtectedRewardClaimPreviewAndPersist");
    assert.ok(rewardRoute);
    assert.equal(rewardRoute.method, "POST");
    assert.equal(rewardRoute.path, "/idempotent/protected/reward-claims/preview-and-persist");
  });

  await t.test("handlers do not mutate input", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const matchInput = clone(valid.valid_idempotent_match_result_persist_request.request);
    const matchSnapshot = JSON.stringify(matchInput);
    handleIdempotentProtectedValidateAndPersistMatchResult(matchInput, catalog, repositories, idempotencyStore);
    assert.equal(JSON.stringify(matchInput), matchSnapshot);

    const rewardInput = clone(valid.valid_idempotent_reward_claim_persist_request.request);
    const rewardSnapshot = JSON.stringify(rewardInput);
    handleIdempotentProtectedRewardClaimPreviewAndPersist(rewardInput, catalog, repositories, idempotencyStore);
    assert.equal(JSON.stringify(rewardInput), rewardSnapshot);
  });

  await t.test("idempotency replay response clone prevents mutation leak", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_idempotent_reward_claim_persist_request.request),
      catalog,
      repositories,
      idempotencyStore
    );

    const replay = handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.replay_idempotent_reward_claim_persist_request.request),
      catalog,
      repositories,
      idempotencyStore
    );
    replay.body.persisted_claim.claim_preview.rewards.player_a.xp_delta = 999;

    const replayAgain = handleIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.replay_idempotent_reward_claim_persist_request.request),
      catalog,
      repositories,
      idempotencyStore
    );
    assert.notEqual(replayAgain.body.persisted_claim.claim_preview.rewards.player_a.xp_delta, 999);
  });
});
