// arsenal_cost_validator.test.mjs
import { test, describe, assert } from 'node:test';
import { strict as assertStrict } from 'assert';
import path from 'path';
import { loadSampleCatalog } from '../src/catalog_loader.mjs';
import { validateArsenal } from '../src/arsenal_cost_validator.mjs';

const projectRoot = process.cwd();

async function loadSample(file) {
  const catalog = await loadSampleCatalog(projectRoot);
  const samplePath = path.join(projectRoot, 'data', 'samples', file);
  const { loadJsonFile } = await import('../src/load_json.mjs');
  return await loadJsonFile(samplePath);
}

describe('ArsenalCostValidator', async () => {
  const validSample = await loadSample('arsenals.valid.sample.json');
  const invalidSample = await loadSample('arsenals.invalid.sample.json');
  const catalog = await loadSampleCatalog(projectRoot);

  test('valid arsenal passes', () => {
    const result = validateArsenal(validSample, catalog);
    assertStrict.equal(result.ok, true, 'Valid arsenal should be ok');
    assertStrict.equal(result.errors.length, 0);
    assertStrict.ok(result.total_cost <= catalog.arsenalRules.total_budget);
  });

  test('invalid arsenal fails with appropriate errors', () => {
    const result = validateArsenal(invalidSample, catalog);
    assertStrict.equal(result.ok, false);
    // Expect at least one error of each type
    const codes = result.errors.map(e => e.code);
    assertStrict.ok(codes.includes('DUPLICATE_ITEM'), 'duplicate error');
    assertStrict.ok(codes.includes('DISABLED_ITEM'), 'disabled error');
    assertStrict.ok(codes.includes('LOCKED_ITEM'), 'locked error');
    assertStrict.ok(codes.includes('OVER_BUDGET'), 'budget error');
  });
});
