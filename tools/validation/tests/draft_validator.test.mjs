// draft_validator.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { loadSampleCatalog } from "../src/catalog_loader.mjs";
import { validateDraft } from "../src/draft_validator.mjs";

const projectRoot = process.cwd();

async function getCatalog() {
  return await loadSampleCatalog(projectRoot);
}

// Load fixtures using loadJsonFile (same pattern as arsenal_cost_validator.test.mjs)
const { loadJsonFile } = await import("../src/load_json.mjs");
const draftValid = await loadJsonFile(path.join(projectRoot, "data", "samples", "draft.valid.sample.json"));
const draftInvalid = await loadJsonFile(path.join(projectRoot, "data", "samples", "draft.invalid.sample.json"));


await test("DraftValidator - valid basic draft", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftValid.basic_valid_draft)); // clone
  const result = validateDraft(input, catalog);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.errors, []);
  assert.deepStrictEqual(result.category_counts, {
    towers: 4,
    creeps: 2,
    spells: 1,
    relics: 0,
    guardians: 0,
  });
});

await test("DraftValidator - valid with optional relic", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftValid.with_optional_relic_valid_draft));
  const result = validateDraft(input, catalog);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.category_counts.relics, 1);
});

await test("DraftValidator - valid with optional guardian", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftValid.with_optional_guardian_valid_draft));
  const result = validateDraft(input, catalog);
  assert.strictEqual(result.ok, true);
  assert.deepStrictEqual(result.errors, []);
  assert.strictEqual(result.category_counts.guardians, 1);
});

await test("DraftValidator - input immutability", async (t) => {
  const catalog = await getCatalog();
  const original = JSON.parse(JSON.stringify(draftValid.basic_valid_draft));
  const input = JSON.parse(JSON.stringify(draftValid.basic_valid_draft));
  validateDraft(input, catalog);
  assert.deepStrictEqual(input, original, "Input object should not be mutated");
});

// Failure cases – helper to assert presence of a specific error code
function expectError(result, code) {
  assert.strictEqual(result.ok, false, "Result should be not ok");
  const found = result.errors.some(e => e.code === code);
  assert.ok(found, `Expected error code ${code} not found`);
}

await test("DraftValidator - pick outside shared pool", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.pick_outside_shared_pool));
  const result = validateDraft(input, catalog);
  expectError(result, "PICK_OUTSIDE_SHARED_POOL");
});

await test("DraftValidator - unknown item id", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.unknown_item));
  const result = validateDraft(input, catalog);
  expectError(result, "UNKNOWN_ITEM_ID");
});

await test("DraftValidator - disabled item", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.disabled_item));
  const result = validateDraft(input, catalog);
  expectError(result, "DISABLED_ITEM");
});

await test("DraftValidator - duplicate pick", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.duplicate_pick));
  const result = validateDraft(input, catalog);
  expectError(result, "DUPLICATE_PICK");
});

await test("DraftValidator - too few towers", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_few_towers));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_FEW_FINAL_TOWERS");
});

await test("DraftValidator - too many towers", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_many_towers));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_MANY_FINAL_TOWERS");
});

await test("DraftValidator - too few creeps", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_few_creeps));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_FEW_FINAL_CREEPS");
});

await test("DraftValidator - too many creeps", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_many_creeps));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_MANY_FINAL_CREEPS");
});

await test("DraftValidator - too few spells", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_few_spells));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_FEW_FINAL_SPELLS");
});

await test("DraftValidator - too many spells", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_many_spells));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_MANY_FINAL_SPELLS");
});

await test("DraftValidator - too many relics", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_many_relics));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_MANY_FINAL_RELICS");
});

await test("DraftValidator - too many guardians", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.too_many_guardians));
  const result = validateDraft(input, catalog);
  expectError(result, "TOO_MANY_FINAL_GUARDIANS");
});

await test("DraftValidator - invalid category", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.invalid_category));
  const result = validateDraft(input, catalog);
  expectError(result, "INVALID_CATEGORY");
});

await test("DraftValidator - missing shared pool", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.missing_shared_pool));
  const result = validateDraft(input, catalog);
  expectError(result, "MISSING_SHARED_POOL");
});

await test("DraftValidator - missing final loadout", async (t) => {
  const catalog = await getCatalog();
  const input = JSON.parse(JSON.stringify(draftInvalid.missing_final_loadout));
  const result = validateDraft(input, catalog);
  expectError(result, "MISSING_FINAL_LOADOUT");
});
