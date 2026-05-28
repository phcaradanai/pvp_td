import test from "node:test";
import assert from "node:assert/strict";
import { buildRewardClaimPreview } from "../reward_claim_contract.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";
import { loadJsonFile } from "../../../tools/validation/src/load_json.mjs";
import path from "path";

const projectRoot = process.cwd();

test("RewardClaimContract tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validPath = path.join(projectRoot, "data", "samples", "backend_contract.valid.sample.json");
  const invalidPath = path.join(projectRoot, "data", "samples", "backend_contract.invalid.sample.json");
  const validData = await loadJsonFile(validPath);
  const invalidData = await loadJsonFile(invalidPath);

  await t.test("valid draw reward claim preview passes", () => {
    const res = buildRewardClaimPreview(validData.valid_draw_reward_claim_preview, catalog);
    assert.ok(res.ok);
    assert.equal(res.claim_preview.match_id, "local_match_001");
    // reward claim uses reward calculation and unlock progression
    assert.ok(res.claim_preview.rewards.player_a);
    assert.ok(res.claim_preview.profiles.player_a);
  });

  await t.test("reward claim uses reward calculation", () => {
    const res = buildRewardClaimPreview(validData.valid_draw_reward_claim_preview, catalog);
    assert.ok(res.ok);
    assert.equal(res.claim_preview.rewards.player_a.reason, "DRAW_REWARD");
  });

  await t.test("reward claim uses unlock progression", () => {
    const res = buildRewardClaimPreview(validData.valid_draw_reward_claim_preview, catalog);
    assert.ok(res.ok);
    assert.equal(res.claim_preview.profiles.player_a.profile.xp, 50); // From draw
  });

  await t.test("missing request_id fails", () => {
    const res = buildRewardClaimPreview(invalidData.reward_claim_missing_request_id, catalog);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_REQUEST_ID"));
  });

  await t.test("missing match_result fails", () => {
    const res = buildRewardClaimPreview(invalidData.reward_claim_missing_match_result, catalog);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_MATCH_RESULT"));
  });

  await t.test("missing players fails", () => {
    const res = buildRewardClaimPreview(invalidData.reward_claim_missing_players, catalog);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_PLAYERS"));
  });

  await t.test("input is not mutated", () => {
    const input = JSON.parse(JSON.stringify(validData.valid_draw_reward_claim_preview));
    const inputStr = JSON.stringify(input);
    buildRewardClaimPreview(input, catalog);
    assert.equal(JSON.stringify(input), inputStr);
  });
});
