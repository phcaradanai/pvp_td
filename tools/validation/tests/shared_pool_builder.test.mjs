// shared_pool_builder.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { buildSharedPool } from "../src/shared_pool_builder.mjs";
import { loadSampleCatalog } from "../src/catalog_loader.mjs";
import { readFile } from "fs/promises";
import path from "path";

const samplesDir = path.resolve("d:/Projects/pvp_td/data/samples");

async function loadJSON(file) {
  const data = await readFile(path.join(samplesDir, file), "utf-8");
  return JSON.parse(data);
}

// Load catalog once for all tests
let catalog;
const projectRoot = path.resolve('d:/Projects/pvp_td');
await (async () => {
  catalog = await loadSampleCatalog(projectRoot);
})();

/** Helper to deep clone input for mutation check */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ----- Passing tests -----
await test("SharedPoolBuilder merges two valid arsenals and includes base pool", async () => {
  const sample = (await loadJSON("shared_pool.valid.sample.json")).basic_merge;
  const result = buildSharedPool(sample, catalog);
  assert.strictEqual(result.ok, true);
  // base pool items must be present (basic_tower, fire_tower, ice_tower, earth_tower, basic_creep, fast_creep)
  const expectedTowers = ["basic_tower", "earth_tower", "fire_tower", "ice_tower"].sort();
  assert.deepStrictEqual(result.shared_pool.towers, expectedTowers);
  const expectedCreeps = ["basic_creep", "fast_creep"].sort();
  assert.deepStrictEqual(result.shared_pool.creeps, expectedCreeps);
});

await test("SharedPoolBuilder removes duplicates when rule true", async () => {
  const sample = (await loadJSON("shared_pool.valid.sample.json")).duplicate_merge;
  const result = buildSharedPool(sample, catalog);
  assert.strictEqual(result.ok, true);
  // fire_tower appears in both players but duplicates removed, so only one instance
  const fireCount = result.shared_pool.towers.filter(id => id === "fire_tower").length;
  assert.strictEqual(fireCount, 1);
  // sources for fire_tower must contain both players
  assert.deepStrictEqual(result.sources["fire_tower"].sort(), ["player_a", "player_b"].sort());
});

await test("SharedPoolBuilder does not mutate original input", async () => {
  const original = (await loadJSON("shared_pool.valid.sample.json")).basic_merge;
  const cloned = deepClone(original);
  const result = buildSharedPool(original, catalog);
  assert.deepStrictEqual(original, cloned, "Input object was mutated");
});

// ----- Failing tests -----
await test("Invalid Player A arsenal fails", async () => {
  const sample = (await loadJSON("shared_pool.invalid.sample.json")).player_a_invalid_arsenal;
  const result = buildSharedPool(sample, catalog);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "PLAYER_A_INVALID_ARSENAL"));
});

await test("Invalid Player B arsenal fails", async () => {
  const sample = (await loadJSON("shared_pool.invalid.sample.json")).player_b_invalid_arsenal;
  const result = buildSharedPool(sample, catalog);
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.some(e => e.code === "PLAYER_B_INVALID_ARSENAL"));
});
