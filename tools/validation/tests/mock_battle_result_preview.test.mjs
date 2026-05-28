import test from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { generateMockBattleResult } from "../src/mock_battle_result_preview.mjs";

const projectRoot = process.cwd();

async function loadFixtures() {
  const { loadJsonFile } = await import("../src/load_json.mjs");
  const valid = await loadJsonFile(path.join(projectRoot, "data", "samples", "mock_result.valid.sample.json"));
  const invalid = await loadJsonFile(path.join(projectRoot, "data", "samples", "mock_result.invalid.sample.json"));
  return { valid, invalid };
}

await test("MockBattleResultPreview - equal core HP returns draw", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.draw_equal_core_hp;
  const originalInput = JSON.parse(JSON.stringify(input));

  const result = generateMockBattleResult(input);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.match_state.winner, null);
  assert.strictEqual(result.result.winner, null);
  assert.strictEqual(result.result.is_draw, true);
  assert.strictEqual(result.result.reason, "EQUAL_CORE_HP_PLACEHOLDER_DRAW");
  assert.strictEqual(result.result.score.player_a.core_hp, 100);
  assert.strictEqual(result.result.score.player_b.core_hp, 100);
  
  const lastAction = result.match_state.action_log[result.match_state.action_log.length - 1];
  assert.strictEqual(lastAction.type, "MOCK_BATTLE_RESULT_GENERATED");
  assert.strictEqual(lastAction.is_draw, true);

  assert.deepStrictEqual(input, originalInput, "Input should not be mutated");
});

await test("MockBattleResultPreview - higher Player A core HP returns Player A winner", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.player_a_wins_by_core_hp;

  const result = generateMockBattleResult(input);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.match_state.winner, "player_a");
  assert.strictEqual(result.result.winner, "player_a");
  assert.strictEqual(result.result.is_draw, false);
  assert.strictEqual(result.result.reason, "PLAYER_A_HIGHER_CORE_HP");
  assert.strictEqual(result.result.score.player_a.core_hp, 100);
  assert.strictEqual(result.result.score.player_b.core_hp, 80);
});

await test("MockBattleResultPreview - higher Player B core HP returns Player B winner", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.player_b_wins_by_core_hp;

  const result = generateMockBattleResult(input);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.match_state.winner, "player_b");
  assert.strictEqual(result.result.winner, "player_b");
  assert.strictEqual(result.result.is_draw, false);
  assert.strictEqual(result.result.reason, "PLAYER_B_HIGHER_CORE_HP");
  assert.strictEqual(result.result.score.player_a.core_hp, 50);
  assert.strictEqual(result.result.score.player_b.core_hp, 100);
});

// Failing tests
function expectError(result, code) {
  assert.strictEqual(result.ok, false, `Expected failure with error code ${code}`);
  const found = result.errors.some(e => e.code === code);
  assert.ok(found, `Expected error code ${code} not found. Errors: ${JSON.stringify(result.errors)}`);
}

await test("MockBattleResultPreview - missing match_state fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.missing_match_state), "MISSING_MATCH_STATE");
});

await test("MockBattleResultPreview - ready_to_start phase fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.invalid_phase_ready_to_start), "INVALID_RESULT_PHASE");
});

await test("MockBattleResultPreview - planning phase fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.invalid_phase_planning), "INVALID_RESULT_PHASE");
});

await test("MockBattleResultPreview - battle_preview phase fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.invalid_phase_battle_preview), "INVALID_RESULT_PHASE");
});

await test("MockBattleResultPreview - missing players fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.missing_players), "MISSING_PLAYERS");
});

await test("MockBattleResultPreview - missing core_hp fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.missing_core_hp), "MISSING_CORE_HP");
});

await test("MockBattleResultPreview - invalid core_hp fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.invalid_core_hp), "INVALID_CORE_HP");
});

await test("MockBattleResultPreview - already generated result fails", async (t) => {
  const { invalid } = await loadFixtures();
  expectError(generateMockBattleResult(invalid.already_generated), "MOCK_RESULT_ALREADY_GENERATED");
});
