import test from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { runLocalE2ELoop } from "../src/local_e2e_loop_harness.mjs";
import { loadSampleCatalog } from "../src/catalog_loader.mjs";

const projectRoot = process.cwd();

async function loadFixtures() {
  const { loadJsonFile } = await import("../src/load_json.mjs");
  const valid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_e2e.valid.sample.json"));
  const invalid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_e2e.invalid.sample.json"));
  const catalog = await loadSampleCatalog(projectRoot);
  return { valid, invalid, catalog };
}

await test("LocalE2ELoopHarness - basic e2e loop returns ok true and draw", async (t) => {
  const { valid, catalog } = await loadFixtures();
  const input = valid.basic_e2e_draw;
  const originalInput = JSON.parse(JSON.stringify(input));

  const result = runLocalE2ELoop(input, catalog);
  
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.final_match_state.phase, "result_preview");
  assert.strictEqual(result.result.is_draw, true);
  assert.strictEqual(result.result.winner, null);

  assert.deepStrictEqual(result.trace, [
    { step: "CREATE_LOCAL_MATCH", phase: "ready_to_start" },
    { step: "START_PLANNING", phase: "planning" },
    { step: "START_BATTLE_PREVIEW", phase: "battle_preview" },
    { step: "FINISH_BATTLE_PREVIEW", phase: "result_preview" },
    { step: "GENERATE_MOCK_RESULT", phase: "result_preview" }
  ]);

  const lastAction = result.final_match_state.action_log[result.final_match_state.action_log.length - 1];
  assert.strictEqual(lastAction.type, "MOCK_BATTLE_RESULT_GENERATED");

  assert.deepStrictEqual(input, originalInput, "Input should not be mutated");
});

await test("LocalE2ELoopHarness - asymmetric unlock e2e loop returns ok true", async (t) => {
  const { valid, catalog } = await loadFixtures();
  const input = valid.asymmetric_unlock_e2e_draw;

  const result = runLocalE2ELoop(input, catalog);
  assert.strictEqual(result.ok, true);
});

await test("LocalE2ELoopHarness - Player A wins when core_hp_override favors Player A", async (t) => {
  const { valid, catalog } = await loadFixtures();
  const input = valid.player_a_wins_by_core_hp_override;

  const result = runLocalE2ELoop(input, catalog);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.result.winner, "player_a");
  assert.strictEqual(result.result.is_draw, false);
});

await test("LocalE2ELoopHarness - Player B wins when core_hp_override favors Player B", async (t) => {
  const { valid, catalog } = await loadFixtures();
  const input = valid.player_b_wins_by_core_hp_override;

  const result = runLocalE2ELoop(input, catalog);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.result.winner, "player_b");
  assert.strictEqual(result.result.is_draw, false);
});

function expectError(result, code) {
  assert.strictEqual(result.ok, false, `Expected failure with error code ${code}`);
  const found = result.errors.some(e => e.code === code);
  assert.ok(found, `Expected error code ${code} not found. Errors: ${JSON.stringify(result.errors)}`);
}

await test("LocalE2ELoopHarness - missing match_id fails", async (t) => {
  const { invalid, catalog } = await loadFixtures();
  expectError(runLocalE2ELoop(invalid.missing_match_id, catalog), "INVALID_E2E_INPUT");
});

await test("LocalE2ELoopHarness - invalid Player A arsenal fails at local match creation", async (t) => {
  const { invalid, catalog } = await loadFixtures();
  const result = runLocalE2ELoop(invalid.invalid_player_a_arsenal, catalog);
  expectError(result, "LOCAL_MATCH_CREATION_FAILED");
  assert.deepStrictEqual(result.trace, []); // Should be empty
});

await test("LocalE2ELoopHarness - invalid Player B arsenal fails at local match creation", async (t) => {
  const { invalid, catalog } = await loadFixtures();
  const result = runLocalE2ELoop(invalid.invalid_player_b_arsenal, catalog);
  expectError(result, "LOCAL_MATCH_CREATION_FAILED");
  assert.deepStrictEqual(result.trace, []); 
});

await test("LocalE2ELoopHarness - invalid Player A draft fails at local match creation", async (t) => {
  const { invalid, catalog } = await loadFixtures();
  const result = runLocalE2ELoop(invalid.invalid_player_a_draft, catalog);
  expectError(result, "LOCAL_MATCH_CREATION_FAILED");
  assert.deepStrictEqual(result.trace, []); 
});

await test("LocalE2ELoopHarness - invalid Player B draft fails at local match creation", async (t) => {
  const { invalid, catalog } = await loadFixtures();
  const result = runLocalE2ELoop(invalid.invalid_player_b_draft, catalog);
  expectError(result, "LOCAL_MATCH_CREATION_FAILED");
  assert.deepStrictEqual(result.trace, []); 
});
