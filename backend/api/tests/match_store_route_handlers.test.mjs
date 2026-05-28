import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import {
  handleStoreMatchProtectedValidateMatchResult,
  handleStoreMatchProtectedRewardClaimPreview,
  handleStoreMatchProtectedValidateAndPersistMatchResult,
  handleStoreMatchProtectedRewardClaimPreviewAndPersist,
  handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult,
  handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist
} from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { ERROR_CODES } from "../api_errors.mjs";
import { createInMemoryRepositories } from "../../persistence/in_memory_repositories.mjs";
import { createInMemoryIdempotencyStore } from "../../idempotency/in_memory_idempotency_store.mjs";
import { createInMemorySessionStore } from "../../session/in_memory_session_store.mjs";
import { createInMemoryMatchStore } from "../../match_store/in_memory_match_store.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createMatchStore(valid, seedOverride = null) {
  return createInMemoryMatchStore(seedOverride ?? valid.valid_match_store_seed);
}

function createSessionStore(valid) {
  return createInMemorySessionStore(valid.valid_session_store_seed);
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

test("Match-store API route handler tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_match_store.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_match_store.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("valid store-match protected match result returns 200", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      clone(valid.valid_store_match_protected_match_result_request.request),
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.accepted_result);
  });

  await t.test("valid store-match protected reward claim returns 200", () => {
    const res = handleStoreMatchProtectedRewardClaimPreview(
      clone(valid.valid_store_match_protected_reward_claim_request.request),
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.claim_preview);
  });

  await t.test("valid store-match protected match result persist returns 200", () => {
    const repositories = createRepositories(valid);
    const res = handleStoreMatchProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_match_persistent_match_result_request.request),
      catalog,
      repositories,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 200);
    assert.deepEqual(repositories.matches.getMatch("local_match_001").result, res.body.persisted_result);
  });

  await t.test("valid store-match protected reward claim persist returns 200", () => {
    const repositories = createRepositories(valid);
    const res = handleStoreMatchProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_store_match_persistent_reward_claim_request.request),
      catalog,
      repositories,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(repositories.reward_claims.getRewardClaim("claim_sm_reward_001").claim_id, "claim_sm_reward_001");
  });

  await t.test("valid store-match idempotent match result returns mode new", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_match_idempotent_match_result_request.request),
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      createMatchStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_sm_match_001"));
  });

  await t.test("valid store-match idempotent reward claim returns mode new", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_store_match_idempotent_reward_claim_request.request),
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      createMatchStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_sm_reward_001"));
  });

  await t.test("replay store-match idempotent match result does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);
    const matchStore = createMatchStore(valid);
    const request = clone(valid.valid_store_match_idempotent_match_result_request.request);

    const first = handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(request, catalog, counted.repositories, sessionStore, matchStore, idempotencyStore);
    const replay = handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(clone(request), catalog, counted.repositories, sessionStore, matchStore, idempotencyStore);

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.matchResultWrites, 1);
  });

  await t.test("replay store-match idempotent reward claim does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);
    const matchStore = createMatchStore(valid);
    const request = clone(valid.valid_store_match_idempotent_reward_claim_request.request);

    const first = handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, counted.repositories, sessionStore, matchStore, idempotencyStore);
    const replay = handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist(clone(request), catalog, counted.repositories, sessionStore, matchStore, idempotencyStore);

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.rewardClaimWrites, 1);
  });

  await t.test("missing matchStore returns 400", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      clone(valid.valid_store_match_protected_match_result_request.request),
      catalog,
      createSessionStore(valid),
      invalid.missing_match_store.matchStore
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MISSING_MATCH_STORE));
  });

  await t.test("missing sessionStore returns 400", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      clone(valid.valid_store_match_protected_match_result_request.request),
      catalog,
      invalid.missing_session_store.sessionStore,
      createMatchStore(valid)
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MISSING_SESSION_STORE));
  });

  await t.test("unknown session returns 400", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      invalid.unknown_session.request,
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.SESSION_STORE_VALIDATION_FAILED));
  });

  await t.test("unknown match returns 400", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      invalid.unknown_match.request,
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MATCH_STORE_VALIDATION_FAILED));
  });

  await t.test("player not in match returns 400 with PLAYER_NOT_IN_MATCH detail", () => {
    const matchStore = createMatchStore(valid, invalid.player_not_in_match.match_store_seed);
    const res = handleStoreMatchProtectedValidateMatchResult(
      invalid.player_not_in_match.request,
      catalog,
      createSessionStore(valid),
      matchStore
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MATCH_STORE_VALIDATION_FAILED));
    const topError = res.body.errors.find(error => error.code === ERROR_CODES.MATCH_STORE_VALIDATION_FAILED);
    assert.ok(topError.details.some(detail => detail.code === "PLAYER_NOT_IN_MATCH"));
  });

  await t.test("invalid match phase returns 400 with INVALID_MATCH_PHASE", () => {
    const matchStore = createMatchStore(valid, invalid.invalid_match_phase.match_store_seed);
    const res = handleStoreMatchProtectedValidateMatchResult(
      invalid.invalid_match_phase.request,
      catalog,
      createSessionStore(valid),
      matchStore
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === "INVALID_MATCH_PHASE"));
  });

  await t.test("client-submitted rewards return 400", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      invalid.client_reward_not_allowed.request,
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === "CLIENT_REWARD_NOT_ALLOWED"));
  });

  await t.test("idempotency conflict returns 409", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);
    const matchStore = createMatchStore(valid);

    handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_match_idempotent_match_result_request.request),
      catalog,
      repositories,
      sessionStore,
      matchStore,
      idempotencyStore
    );
    const res = handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(
      invalid.idempotency_conflict.request,
      catalog,
      repositories,
      sessionStore,
      matchStore,
      idempotencyStore
    );

    assert.equal(res.status, 409);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.IDEMPOTENCY_CHECK_FAILED));
  });

  await t.test("failed match store validation does not persist", () => {
    const repositories = createRepositories(valid);
    const matchStore = createMatchStore(valid, invalid.player_not_in_match.match_store_seed);
    const res = handleStoreMatchProtectedValidateAndPersistMatchResult(
      invalid.player_not_in_match.request,
      catalog,
      repositories,
      createSessionStore(valid),
      matchStore
    );

    assert.equal(res.status, 400);
    assert.equal(repositories.matches.getMatch("local_match_001").result, undefined);
  });

  await t.test("failed match store validation does not save idempotency success", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const request = clone(valid.valid_store_match_idempotent_match_result_request.request);
    request.body.match_id = "match_does_not_exist";
    request.body.idempotency_key = "idem_sm_matchstore_fail";

    const res = handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(
      request,
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      createMatchStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_sm_matchstore_fail"), null);
  });

  await t.test("client-submitted server_context is ignored when matchStore is authoritative", () => {
    const res = handleStoreMatchProtectedValidateMatchResult(
      clone(invalid.client_context_override.request),
      catalog,
      createSessionStore(valid),
      createMatchStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
  });

  await t.test("route metadata includes store-match routes", () => {
    const paths = routeMetadata.routes.map(route => route.path);
    assert.ok(paths.includes("/store-match/protected/match-results/validate"));
    assert.ok(paths.includes("/store-match/protected/reward-claims/preview"));
    assert.ok(paths.includes("/store-match/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store-match/protected/reward-claims/preview-and-persist"));
    assert.ok(paths.includes("/store-match/idempotent/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store-match/idempotent/protected/reward-claims/preview-and-persist"));
  });

  await t.test("handlers do not mutate input", () => {
    const request = clone(valid.valid_store_match_idempotent_match_result_request.request);
    const snapshot = JSON.stringify(request);
    handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(
      request,
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      createMatchStore(valid),
      createIdempotencyStore(valid)
    );

    assert.equal(JSON.stringify(request), snapshot);
  });

  await t.test("match store clone prevents mutation leak through API response", () => {
    const matchStore = createMatchStore(valid);
    const res = handleStoreMatchProtectedValidateMatchResult(
      clone(valid.valid_store_match_protected_match_result_request.request),
      catalog,
      createSessionStore(valid),
      matchStore
    );
    res.body.accepted_result.score.player_a.core_hp = -999;

    const storedMatch = matchStore.getMatch("local_match_001");
    assert.equal(storedMatch.allowed_player_ids[0], "player_a");
    assert.equal(storedMatch.status, "completed");
  });
});
