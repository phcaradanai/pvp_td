// local_match_skeleton.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { loadSampleCatalog } from "../src/catalog_loader.mjs";
import { createLocalMatchSkeleton } from "../src/local_match_skeleton.mjs";

const projectRoot = process.cwd();

async function getCatalog() {
  return await loadSampleCatalog(projectRoot);
}

// Helper for loading JSON safely in Node 22
async function loadFixtures() {
  const { loadJsonFile } = await import("../src/load_json.mjs");
  const valid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_match.valid.sample.json"));
  const invalid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_match.invalid.sample.json"));
  return { valid, invalid };
}

await test("LocalMatchSkeleton - valid basic local match", async (t) => {
  const catalog = await getCatalog();
  const { valid } = await loadFixtures();
  const originalInput = JSON.parse(JSON.stringify(valid.basic_local_match_ready));
  const input = JSON.parse(JSON.stringify(valid.basic_local_match_ready));
  
  const result = createLocalMatchSkeleton(input, catalog);
  assert.strictEqual(result.ok, true, "Valid local match should pass");
  assert.deepStrictEqual(result.errors, []);
  
  const matchState = result.match_state;
  assert.strictEqual(matchState.phase, "ready_to_start");
  assert.ok(matchState.shared_pool, "Includes shared pool");
  assert.ok(matchState.players.player_a.final_loadout, "Includes player a final loadout");
  assert.ok(matchState.players.player_b.final_loadout, "Includes player b final loadout");
  assert.deepStrictEqual(matchState.core_hp, { player_a: 100, player_b: 100 });
  assert.strictEqual(matchState.turn, 0);
  assert.strictEqual(matchState.round, 0);
  assert.strictEqual(matchState.winner, null);
  assert.deepStrictEqual(matchState.action_log, []);
  
  // Verify non-mutation
  assert.deepStrictEqual(input, originalInput, "Input should not be mutated");
});

await test("LocalMatchSkeleton - asymmetric unlock local match", async (t) => {
  const catalog = await getCatalog();
  const { valid } = await loadFixtures();
  const input = valid.asymmetric_unlock_local_match_ready;
  
  const result = createLocalMatchSkeleton(input, catalog);
  assert.strictEqual(result.ok, true, "Valid asymmetric unlock local match should pass");
  assert.strictEqual(result.match_state.phase, "ready_to_start");
});

function expectError(result, code) {
  assert.strictEqual(result.ok, false, "Result should be ok: false");
  const found = result.errors.some(e => e.code === code);
  assert.ok(found, `Expected error code ${code} not found in errors`);
}

await test("LocalMatchSkeleton - missing match id", async (t) => {
  const catalog = await getCatalog();
  const { invalid } = await loadFixtures();
  const input = invalid.missing_match_id;
  const result = createLocalMatchSkeleton(input, catalog);
  expectError(result, "MISSING_MATCH_ID");
});

await test("LocalMatchSkeleton - invalid player a arsenal", async (t) => {
  const catalog = await getCatalog();
  const { invalid } = await loadFixtures();
  const input = invalid.invalid_player_a_arsenal;
  const result = createLocalMatchSkeleton(input, catalog);
  expectError(result, "SHARED_POOL_BUILD_FAILED");
  // Check inner detail error
  const poolError = result.errors.find(e => e.code === "SHARED_POOL_BUILD_FAILED");
  assert.ok(poolError.details.some(d => d.code === "PLAYER_A_INVALID_ARSENAL"), "Expected nested player A arsenal error");
});

await test("LocalMatchSkeleton - invalid player b arsenal", async (t) => {
  const catalog = await getCatalog();
  const { invalid } = await loadFixtures();
  const input = invalid.invalid_player_b_arsenal;
  const result = createLocalMatchSkeleton(input, catalog);
  expectError(result, "SHARED_POOL_BUILD_FAILED");
  const poolError = result.errors.find(e => e.code === "SHARED_POOL_BUILD_FAILED");
  assert.ok(poolError.details.some(d => d.code === "PLAYER_B_INVALID_ARSENAL"), "Expected nested player B arsenal error");
});

await test("LocalMatchSkeleton - invalid player a draft", async (t) => {
  const catalog = await getCatalog();
  const { invalid } = await loadFixtures();
  const input = invalid.invalid_player_a_draft;
  const result = createLocalMatchSkeleton(input, catalog);
  expectError(result, "PLAYER_A_DRAFT_INVALID");
});

await test("LocalMatchSkeleton - invalid player b draft", async (t) => {
  const catalog = await getCatalog();
  const { invalid } = await loadFixtures();
  const input = invalid.invalid_player_b_draft;
  const result = createLocalMatchSkeleton(input, catalog);
  expectError(result, "PLAYER_B_DRAFT_INVALID");
});
