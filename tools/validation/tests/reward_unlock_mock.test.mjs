import test from "node:test";
import assert from "node:assert/strict";
import { calculateMockRewards, calculateUnlockProgress } from "../src/reward_unlock_mock.mjs";
import { loadSampleCatalog } from "../src/catalog_loader.mjs";
import { loadJsonFile } from "../src/load_json.mjs";
import path from "path";

const projectRoot = process.cwd();

test("RewardUnlockMock tests", async (t) => {
  const catalog = await loadSampleCatalog(projectRoot);
  const validPath = path.join(projectRoot, "data", "samples", "reward_mock.valid.sample.json");
  const invalidPath = path.join(projectRoot, "data", "samples", "reward_mock.invalid.sample.json");
  const validData = await loadJsonFile(validPath);
  const invalidData = await loadJsonFile(invalidPath);

  await t.test("draw gives both players draw reward", () => {
    const res = calculateMockRewards(validData.draw_rewards, catalog);
    assert.ok(res.ok);
    assert.equal(res.rewards.player_a.reason, "DRAW_REWARD");
    assert.equal(res.rewards.player_b.reason, "DRAW_REWARD");
    assert.equal(res.rewards.player_a.xp_delta, 50);
  });

  await t.test("Player A win gives Player A win reward and Player B participation reward", () => {
    const res = calculateMockRewards(validData.player_a_win_rewards, catalog);
    assert.ok(res.ok);
    assert.equal(res.rewards.player_a.reason, "WIN_REWARD");
    assert.equal(res.rewards.player_b.reason, "PARTICIPATION_REWARD");
    assert.equal(res.rewards.player_a.xp_delta, 100);
    assert.equal(res.rewards.player_b.xp_delta, 20);
  });

  await t.test("Player B win gives Player B win reward and Player A participation reward", () => {
    const res = calculateMockRewards(validData.player_b_win_rewards, catalog);
    assert.ok(res.ok);
    assert.equal(res.rewards.player_b.reason, "WIN_REWARD");
    assert.equal(res.rewards.player_a.reason, "PARTICIPATION_REWARD");
    assert.equal(res.rewards.player_b.xp_delta, 100);
    assert.equal(res.rewards.player_a.xp_delta, 20);
  });

  await t.test("reward output is deterministic", () => {
    const res1 = calculateMockRewards(validData.draw_rewards, catalog);
    const res2 = calculateMockRewards(validData.draw_rewards, catalog);
    assert.deepEqual(res1, res2);
  });

  await t.test("reward calculation does not mutate input", () => {
    const inputStr = JSON.stringify(validData.draw_rewards);
    calculateMockRewards(validData.draw_rewards, catalog);
    assert.equal(JSON.stringify(validData.draw_rewards), inputStr);
  });

  await t.test("reward applies xp and currency", () => {
    const res = calculateUnlockProgress(validData.unlock_progress_no_new_unlock, catalog);
    assert.ok(res.ok);
    assert.equal(res.profiles.player_a.profile.xp, 50);
    assert.equal(res.profiles.player_a.profile.soft_currency, 10);
  });

  await t.test("no unlock when threshold not met", () => {
    const res = calculateUnlockProgress(validData.unlock_progress_no_new_unlock, catalog);
    assert.ok(res.ok);
    assert.equal(res.profiles.player_a.new_unlocks.length, 0);
  });

  await t.test("option unlock works when threshold met", () => {
    // Player starts with level 10, 450 currency. Reward gives 50. Total 500. Storm/Poison cost 500.
    const res = calculateUnlockProgress(validData.unlock_progress_with_new_option_unlock, catalog);
    assert.ok(res.ok);
    assert.ok(res.profiles.player_a.new_unlocks.includes("unlock_storm_tower"));
    assert.ok(res.profiles.player_a.profile.unlocked_ids.includes("unlock_storm_tower"));
    // check currency deducted
    assert.equal(res.profiles.player_a.profile.soft_currency, 0); 
    // Wait, multiple unlocks could trigger if there's enough money. They cost 500 each, and player had 500. So it unlocks the first one it can afford, which drops currency to 0, so it can't afford the second.
  });

  await t.test("cosmetic unlock works when threshold met", () => {
    // In sample, player a has level 5, 50 currency. Reward gives 100 xp, 50 currency. Total 100 currency.
    // Cosmetic fire projectile costs 100.
    const res = calculateUnlockProgress(validData.unlock_progress_with_cosmetic_unlock, catalog);
    assert.ok(res.ok);
    assert.ok(res.profiles.player_a.new_unlocks.includes("cosmetic_fire_projectile_skin"));
    assert.ok(res.profiles.player_a.profile.unlocked_ids.includes("cosmetic_fire_projectile_skin"));
    assert.equal(res.profiles.player_a.profile.soft_currency, 0); 
  });

  await t.test("existing unlock is not duplicated", () => {
    const res = calculateUnlockProgress(validData.unlock_progress_with_new_option_unlock, catalog);
    assert.ok(res.ok);
    // basic_tower was already in input, so it should not be in new_unlocks
    assert.equal(res.profiles.player_a.new_unlocks.includes("unlock_base_tower"), false);
  });

  await t.test("unlock progress does not mutate input", () => {
    const inputStr = JSON.stringify(validData.unlock_progress_no_new_unlock);
    calculateUnlockProgress(validData.unlock_progress_no_new_unlock, catalog);
    assert.equal(JSON.stringify(validData.unlock_progress_no_new_unlock), inputStr);
  });

  await t.test("missing match_result fails", () => {
    const res = calculateMockRewards(invalidData.missing_match_result, catalog);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, "MISSING_MATCH_RESULT");
  });

  await t.test("missing players fails", () => {
    const res = calculateMockRewards(invalidData.missing_players, catalog);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, "MISSING_PLAYERS");
  });

  await t.test("invalid match_result fails", () => {
    const res = calculateMockRewards(invalidData.invalid_match_result, catalog);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, "INVALID_MATCH_RESULT");
  });

  await t.test("invalid player profile fails", () => {
    const res = calculateMockRewards(invalidData.invalid_player_profile, catalog);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, "INVALID_PLAYER_PROFILE");
  });

  await t.test("unlock node with permanent PvP stat advantage fails", () => {
    // Inject a bad catalog node
    const badCatalog = JSON.parse(JSON.stringify(catalog));
    badCatalog.unlock_tree.push({ id: "bad_node", grants_stat_advantage: true });
    const res = calculateUnlockProgress(invalidData.unlock_grants_pvp_stat_advantage, badCatalog);
    assert.equal(res.ok, false);
    assert.equal(res.errors[0].code, "UNLOCK_GRANTS_PVP_STAT_ADVANTAGE");
  });
});
