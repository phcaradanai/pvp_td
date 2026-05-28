import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import {
  handleStoreProtectedValidateMatchResult,
  handleStoreProtectedRewardClaimPreview,
  handleStoreProtectedValidateAndPersistMatchResult,
  handleStoreProtectedRewardClaimPreviewAndPersist,
  handleStoreIdempotentProtectedValidateAndPersistMatchResult,
  handleStoreIdempotentProtectedRewardClaimPreviewAndPersist
} from "../route_handlers.mjs";
import { routeMetadata } from "../route_contracts.mjs";
import { ERROR_CODES } from "../api_errors.mjs";
import { createInMemoryRepositories } from "../../persistence/in_memory_repositories.mjs";
import { createInMemoryIdempotencyStore } from "../../idempotency/in_memory_idempotency_store.mjs";
import { createInMemorySessionStore } from "../../session/in_memory_session_store.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSessionStore(valid, extra = {}) {
  return createInMemorySessionStore({
    ...valid.valid_session_store_seed,
    ...extra
  });
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

function inactiveSessions() {
  return {
    sess_inactive: {
      session_id: "sess_inactive",
      player_id: "player_a",
      status: "expired",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      revoked_reason: null
    },
    sess_revoked: {
      session_id: "sess_revoked",
      player_id: "player_a",
      status: "revoked",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      revoked_reason: "USER_LOGOUT"
    }
  };
}

test("Session-store API route handler tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_session_store.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "backend_api_session_store.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("valid store protected match result returns 200", () => {
    const res = handleStoreProtectedValidateMatchResult(
      clone(valid.valid_store_protected_match_result_request.request),
      catalog,
      createSessionStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.accepted_result);
  });

  await t.test("valid store protected reward claim returns 200", () => {
    const res = handleStoreProtectedRewardClaimPreview(
      clone(valid.valid_store_protected_reward_claim_request.request),
      catalog,
      createSessionStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.claim_preview);
  });

  await t.test("valid store protected match result persist returns 200", () => {
    const repositories = createRepositories(valid);
    const res = handleStoreProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_persistent_match_result_request.request),
      catalog,
      repositories,
      createSessionStore(valid)
    );

    assert.equal(res.status, 200);
    assert.deepEqual(repositories.matches.getMatch("local_match_001").result, res.body.persisted_result);
  });

  await t.test("valid store protected reward claim persist returns 200", () => {
    const repositories = createRepositories(valid);
    const res = handleStoreProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_store_persistent_reward_claim_request.request),
      catalog,
      repositories,
      createSessionStore(valid)
    );

    assert.equal(res.status, 200);
    assert.equal(repositories.reward_claims.getRewardClaim("claim_store_reward_001").claim_id, "claim_store_reward_001");
  });

  await t.test("valid store idempotent match result persist returns mode new", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleStoreIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_idempotent_match_result_request.request),
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_store_match_001"));
  });

  await t.test("valid store idempotent reward claim persist returns mode new", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const res = handleStoreIdempotentProtectedRewardClaimPreviewAndPersist(
      clone(valid.valid_store_idempotent_reward_claim_request.request),
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.idempotency.mode, "new");
    assert.ok(idempotencyStore.getRecord("idem_store_reward_001"));
  });

  await t.test("replay store idempotent match result does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);
    const request = clone(valid.valid_store_idempotent_match_result_request.request);

    const first = handleStoreIdempotentProtectedValidateAndPersistMatchResult(request, catalog, counted.repositories, sessionStore, idempotencyStore);
    const replay = handleStoreIdempotentProtectedValidateAndPersistMatchResult(clone(request), catalog, counted.repositories, sessionStore, idempotencyStore);

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.matchResultWrites, 1);
  });

  await t.test("replay store idempotent reward claim does not persist again", () => {
    const counted = withWriteCounters(createRepositories(valid));
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);
    const request = clone(valid.valid_store_idempotent_reward_claim_request.request);

    const first = handleStoreIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, counted.repositories, sessionStore, idempotencyStore);
    const replay = handleStoreIdempotentProtectedRewardClaimPreviewAndPersist(clone(request), catalog, counted.repositories, sessionStore, idempotencyStore);

    assert.equal(first.status, 200);
    assert.equal(replay.status, 200);
    assert.equal(replay.body.idempotency.mode, "replay");
    assert.equal(counted.counters.rewardClaimWrites, 1);
  });

  await t.test("missing sessionStore returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(
      clone(valid.valid_store_protected_match_result_request.request),
      catalog,
      invalid.missing_session_store.sessionStore
    );

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MISSING_SESSION_STORE));
  });

  await t.test("unknown session returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.unknown_session.request, catalog, createSessionStore(valid));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.SESSION_STORE_VALIDATION_FAILED));
  });

  await t.test("session player mismatch returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.session_player_mismatch.request, catalog, createSessionStore(valid));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors[0].details.some(error => error.code === "SESSION_PLAYER_MISMATCH"));
  });

  await t.test("inactive session returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.inactive_session.request, catalog, createSessionStore(valid, inactiveSessions()));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors[0].details.some(error => error.code === "INACTIVE_SESSION"));
  });

  await t.test("revoked session returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.revoked_session.request, catalog, createSessionStore(valid, inactiveSessions()));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors[0].details.some(error => error.code === "INACTIVE_SESSION"));
  });

  await t.test("player not in match returns 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.player_not_in_match.request, catalog, createSessionStore(valid));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.MATCH_PARTICIPATION_FAILED));
  });

  await t.test("client-submitted rewards return 400", () => {
    const res = handleStoreProtectedValidateMatchResult(invalid.client_reward_not_allowed.request, catalog, createSessionStore(valid));
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some(error => error.code === "CLIENT_REWARD_NOT_ALLOWED"));
  });

  await t.test("idempotency conflict returns 409", () => {
    const repositories = createRepositories(valid);
    const idempotencyStore = createIdempotencyStore(valid);
    const sessionStore = createSessionStore(valid);

    handleStoreIdempotentProtectedValidateAndPersistMatchResult(
      clone(valid.valid_store_idempotent_match_result_request.request),
      catalog,
      repositories,
      sessionStore,
      idempotencyStore
    );
    const res = handleStoreIdempotentProtectedValidateAndPersistMatchResult(
      invalid.idempotency_conflict.request,
      catalog,
      repositories,
      sessionStore,
      idempotencyStore
    );

    assert.equal(res.status, 409);
    assert.ok(res.body.errors.some(error => error.code === ERROR_CODES.IDEMPOTENCY_CHECK_FAILED));
  });

  await t.test("failed session validation does not persist", () => {
    const repositories = createRepositories(valid);
    const res = handleStoreProtectedValidateAndPersistMatchResult(
      invalid.unknown_session.request,
      catalog,
      repositories,
      createSessionStore(valid)
    );

    assert.equal(res.status, 400);
    assert.equal(repositories.matches.getMatch("local_match_001").result, undefined);
  });

  await t.test("failed session validation does not save idempotency success", () => {
    const idempotencyStore = createIdempotencyStore(valid);
    const request = clone(valid.valid_store_idempotent_match_result_request.request);
    request.body.session.session_id = "sess_unknown";
    request.body.idempotency_key = "idem_store_session_fail";

    const res = handleStoreIdempotentProtectedValidateAndPersistMatchResult(
      request,
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      idempotencyStore
    );

    assert.equal(res.status, 400);
    assert.equal(idempotencyStore.getRecord("idem_store_session_fail"), null);
  });

  await t.test("route metadata includes store-backed routes", () => {
    const paths = routeMetadata.routes.map(route => route.path);
    assert.ok(paths.includes("/store/protected/match-results/validate"));
    assert.ok(paths.includes("/store/protected/reward-claims/preview"));
    assert.ok(paths.includes("/store/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store/protected/reward-claims/preview-and-persist"));
    assert.ok(paths.includes("/store/idempotent/protected/match-results/validate-and-persist"));
    assert.ok(paths.includes("/store/idempotent/protected/reward-claims/preview-and-persist"));
  });

  await t.test("handlers do not mutate input", () => {
    const request = clone(valid.valid_store_idempotent_match_result_request.request);
    const snapshot = JSON.stringify(request);
    handleStoreIdempotentProtectedValidateAndPersistMatchResult(
      request,
      catalog,
      createRepositories(valid),
      createSessionStore(valid),
      createIdempotencyStore(valid)
    );

    assert.equal(JSON.stringify(request), snapshot);
  });

  await t.test("session store clone prevents mutation leak through API response", () => {
    const sessionStore = createSessionStore(valid);
    const res = handleStoreProtectedValidateMatchResult(
      clone(valid.valid_store_protected_match_result_request.request),
      catalog,
      sessionStore
    );
    res.body.accepted_result.score.player_a.core_hp = -999;

    assert.equal(sessionStore.getSession("sess_001").status, "active");
    assert.equal(sessionStore.getSession("sess_001").player_id, "player_a");
  });
});
