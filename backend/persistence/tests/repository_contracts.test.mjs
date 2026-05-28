import test from "node:test";
import assert from "node:assert/strict";
import {
  PROFILE_REPOSITORY_CONTRACT,
  SESSION_REPOSITORY_CONTRACT,
  MATCH_REPOSITORY_CONTRACT,
  REWARD_CLAIM_REPOSITORY_CONTRACT
} from "../repository_contracts.mjs";

function assertRequiredMethods(contract, methods) {
  assert.ok(contract);
  assert.ok(Array.isArray(contract.methods));
  for (const method of methods) {
    assert.ok(contract.methods.includes(method));
  }
}

test("Persistence repository contract metadata tests", async (t) => {
  await t.test("repository contract metadata exists", () => {
    assert.equal(PROFILE_REPOSITORY_CONTRACT.name, "ProfileRepository");
    assert.equal(SESSION_REPOSITORY_CONTRACT.name, "SessionRepository");
    assert.equal(MATCH_REPOSITORY_CONTRACT.name, "MatchRepository");
    assert.equal(REWARD_CLAIM_REPOSITORY_CONTRACT.name, "RewardClaimRepository");
  });

  await t.test("profile repository contract has required methods", () => {
    assertRequiredMethods(PROFILE_REPOSITORY_CONTRACT, ["getProfile", "saveProfile", "updateProfile"]);
  });

  await t.test("session repository contract has required methods", () => {
    assertRequiredMethods(SESSION_REPOSITORY_CONTRACT, ["getSession", "saveSession"]);
  });

  await t.test("match repository contract has required methods", () => {
    assertRequiredMethods(MATCH_REPOSITORY_CONTRACT, ["getMatch", "saveMatch", "saveMatchResult"]);
  });

  await t.test("reward claim repository contract has required methods", () => {
    assertRequiredMethods(REWARD_CLAIM_REPOSITORY_CONTRACT, ["getRewardClaim", "saveRewardClaim"]);
  });
});
