import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { createInMemoryRepositories } from "../in_memory_repositories.mjs";
import { saveValidatedMatchResult, saveRewardClaimPreview } from "../persistence_service.mjs";

const projectRoot = process.cwd();

function createSeed(valid) {
  return {
    profiles: {
      [valid.valid_profile_seed.player_id]: valid.valid_profile_seed
    },
    sessions: {
      [valid.valid_session_seed.session_id]: valid.valid_session_seed
    },
    matches: {
      [valid.valid_match_seed.match_id]: valid.valid_match_seed
    }
  };
}

test("Persistence service and in-memory repository tests", async (t) => {
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "persistence.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "persistence.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("in-memory repositories can save and get profile", () => {
    const repositories = createInMemoryRepositories();
    const saved = repositories.profiles.saveProfile(valid.valid_profile_seed);
    const loaded = repositories.profiles.getProfile("player_a");

    assert.deepEqual(loaded, saved);
    assert.equal(loaded.player_id, "player_a");
  });

  await t.test("in-memory repositories can save and get session", () => {
    const repositories = createInMemoryRepositories();
    const saved = repositories.sessions.saveSession(valid.valid_session_seed);
    const loaded = repositories.sessions.getSession("sess_001");

    assert.deepEqual(loaded, saved);
    assert.equal(loaded.status, "active");
  });

  await t.test("in-memory repositories can save and get match", () => {
    const repositories = createInMemoryRepositories();
    const saved = repositories.matches.saveMatch(valid.valid_match_seed);
    const loaded = repositories.matches.getMatch("local_match_001");

    assert.deepEqual(loaded, saved);
    assert.equal(loaded.phase, "result_preview");
  });

  await t.test("in-memory repositories can save match result", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const result = valid.valid_save_match_result.accepted_result;
    const saved = repositories.matches.saveMatchResult("local_match_001", result);
    const match = repositories.matches.getMatch("local_match_001");

    assert.deepEqual(saved, result);
    assert.deepEqual(match.result, result);
  });

  await t.test("in-memory repositories can save reward claim", () => {
    const repositories = createInMemoryRepositories();
    const claim = valid.valid_save_reward_claim_preview;
    const saved = repositories.reward_claims.saveRewardClaim(claim);
    const loaded = repositories.reward_claims.getRewardClaim("claim_001");

    assert.deepEqual(loaded, saved);
    assert.equal(loaded.claim_preview.match_id, "local_match_001");
  });

  await t.test("saveValidatedMatchResult saves accepted result", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveValidatedMatchResult(valid.valid_save_match_result, repositories);

    assert.equal(res.ok, true);
    assert.deepEqual(res.saved_result, valid.valid_save_match_result.accepted_result);
    assert.equal(res.errors.length, 0);
  });

  await t.test("saveRewardClaimPreview saves claim preview", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveRewardClaimPreview(valid.valid_save_reward_claim_preview, repositories);

    assert.equal(res.ok, true);
    assert.equal(res.saved_claim.claim_id, "claim_001");
    assert.deepEqual(res.saved_claim.claim_preview, valid.valid_save_reward_claim_preview.claim_preview);
  });

  await t.test("missing accepted_result fails", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveValidatedMatchResult(invalid.missing_accepted_result, repositories);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_ACCEPTED_RESULT"));
  });

  await t.test("missing match_id fails", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveValidatedMatchResult(invalid.missing_match_id, repositories);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_MATCH_ID"));
  });

  await t.test("match not found fails", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveValidatedMatchResult(invalid.match_not_found, repositories);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MATCH_NOT_FOUND"));
  });

  await t.test("missing claim_id fails", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveRewardClaimPreview(invalid.missing_claim_id, repositories);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_CLAIM_ID"));
  });

  await t.test("missing claim_preview fails", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const res = saveRewardClaimPreview(invalid.missing_claim_preview, repositories);

    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_CLAIM_PREVIEW"));
  });

  await t.test("repository clone prevents mutation leak", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const loaded = repositories.profiles.getProfile("player_a");
    loaded.unlocked_ids.push("mutated_unlock");

    const loadedAgain = repositories.profiles.getProfile("player_a");
    assert.deepEqual(loadedAgain.unlocked_ids, []);
  });

  await t.test("service does not mutate input", () => {
    const repositories = createInMemoryRepositories(createSeed(valid));
    const matchInput = JSON.parse(JSON.stringify(valid.valid_save_match_result));
    const matchSnapshot = JSON.stringify(matchInput);
    saveValidatedMatchResult(matchInput, repositories);
    assert.equal(JSON.stringify(matchInput), matchSnapshot);

    const claimInput = JSON.parse(JSON.stringify(valid.valid_save_reward_claim_preview));
    const claimSnapshot = JSON.stringify(claimInput);
    saveRewardClaimPreview(claimInput, repositories);
    assert.equal(JSON.stringify(claimInput), claimSnapshot);
  });

  await t.test("invalid repositories fail", () => {
    const matchRes = saveValidatedMatchResult(valid.valid_save_match_result, invalid.invalid_repositories.repositories);
    const claimRes = saveRewardClaimPreview(valid.valid_save_reward_claim_preview, invalid.invalid_repositories.repositories);

    assert.equal(matchRes.ok, false);
    assert.ok(matchRes.errors.some(e => e.code === "INVALID_REPOSITORIES"));
    assert.equal(claimRes.ok, false);
    assert.ok(claimRes.errors.some(e => e.code === "INVALID_REPOSITORIES"));
  });
});
