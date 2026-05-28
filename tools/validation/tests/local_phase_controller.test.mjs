// local_phase_controller.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import path from "path";
import { advanceLocalPhase } from "../src/local_phase_controller.mjs";

const projectRoot = process.cwd();

async function loadFixtures() {
  const { loadJsonFile } = await import("../src/load_json.mjs");
  const valid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_phase.valid.sample.json"));
  const invalid = await loadJsonFile(path.join(projectRoot, "data", "samples", "local_phase.invalid.sample.json"));
  return { valid, invalid };
}

await test("LocalPhaseController - ready_to_start can advance to planning", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.start_planning;
  const originalInput = JSON.parse(JSON.stringify(input));

  const result = advanceLocalPhase(input);
  assert.strictEqual(result.ok, true, "Should transition from ready_to_start to planning");
  assert.strictEqual(result.match_state.phase, "planning");
  assert.strictEqual(result.match_state.turn, 1, "Turn should increment when entering planning");
  assert.strictEqual(result.match_state.round, 0);
  assert.deepStrictEqual(result.match_state.action_log, [
    { type: "PHASE_CHANGED", from: "ready_to_start", to: "planning", action: "START_PLANNING" }
  ]);
  
  assert.deepStrictEqual(input, originalInput, "Input should not be mutated");
});

await test("LocalPhaseController - planning can advance to battle_preview", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.start_battle_preview;
  
  const result = advanceLocalPhase(input);
  assert.strictEqual(result.ok, true, "Should transition from planning to battle_preview");
  assert.strictEqual(result.match_state.phase, "battle_preview");
  assert.strictEqual(result.match_state.turn, 1);
  assert.strictEqual(result.match_state.round, 1, "Round should increment when entering battle_preview");
  assert.deepStrictEqual(result.match_state.action_log, [
    { type: "PHASE_CHANGED", from: "planning", to: "battle_preview", action: "START_BATTLE_PREVIEW" }
  ]);
});

await test("LocalPhaseController - battle_preview can advance to result_preview", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.finish_battle_preview;
  
  const result = advanceLocalPhase(input);
  assert.strictEqual(result.ok, true, "Should transition from battle_preview to result_preview");
  assert.strictEqual(result.match_state.phase, "result_preview");
  assert.strictEqual(result.match_state.turn, 1);
  assert.strictEqual(result.match_state.round, 1);
  assert.deepStrictEqual(result.match_state.action_log, [
    { type: "PHASE_CHANGED", from: "battle_preview", to: "result_preview", action: "FINISH_BATTLE_PREVIEW" }
  ]);
});

await test("LocalPhaseController - result_preview can reset to ready_to_start", async (t) => {
  const { valid } = await loadFixtures();
  const input = valid.reset_to_ready;
  
  const result = advanceLocalPhase(input);
  assert.strictEqual(result.ok, true, "Should transition from result_preview to ready_to_start");
  assert.strictEqual(result.match_state.phase, "ready_to_start");
  assert.strictEqual(result.match_state.turn, 1);
  assert.strictEqual(result.match_state.round, 1);
  assert.deepStrictEqual(result.match_state.action_log, [
    { type: "PHASE_CHANGED", from: "result_preview", to: "ready_to_start", action: "RESET_TO_READY" }
  ]);
});

await test("LocalPhaseController - full placeholder cycle works", async (t) => {
  const { valid } = await loadFixtures();
  let state = valid.full_placeholder_cycle.match_state;

  // step 1
  let res = advanceLocalPhase({ match_state: state, action: { type: "START_PLANNING" } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.match_state.phase, "planning");
  assert.strictEqual(res.match_state.turn, 1);
  assert.strictEqual(res.match_state.round, 0);
  state = res.match_state;

  // step 2
  res = advanceLocalPhase({ match_state: state, action: { type: "START_BATTLE_PREVIEW" } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.match_state.phase, "battle_preview");
  assert.strictEqual(res.match_state.turn, 1);
  assert.strictEqual(res.match_state.round, 1);
  state = res.match_state;

  // step 3
  res = advanceLocalPhase({ match_state: state, action: { type: "FINISH_BATTLE_PREVIEW" } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.match_state.phase, "result_preview");
  assert.strictEqual(res.match_state.turn, 1);
  assert.strictEqual(res.match_state.round, 1);
  state = res.match_state;

  // step 4
  res = advanceLocalPhase({ match_state: state, action: { type: "RESET_TO_READY" } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.match_state.phase, "ready_to_start");
  assert.strictEqual(res.match_state.turn, 1);
  assert.strictEqual(res.match_state.round, 1);
  assert.strictEqual(res.match_state.action_log.length, 4);
});

// Failing tests
function expectError(result, code) {
  assert.strictEqual(result.ok, false, `Expected failure with error code ${code}`);
  const found = result.errors.some(e => e.code === code);
  assert.ok(found, `Expected error code ${code} not found. Errors: ${JSON.stringify(result.errors)}`);
}

await test("LocalPhaseController - missing match_state fails", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.missing_match_state);
  expectError(result, "MISSING_MATCH_STATE");
});

await test("LocalPhaseController - missing action fails", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.missing_action);
  expectError(result, "MISSING_ACTION");
});

await test("LocalPhaseController - invalid action type fails", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.invalid_action_type);
  expectError(result, "INVALID_ACTION_TYPE");
});

await test("LocalPhaseController - invalid phase fails", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.invalid_phase);
  expectError(result, "INVALID_PHASE");
});

await test("LocalPhaseController - ready_to_start cannot go directly to battle_preview", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.invalid_transition_ready_to_battle);
  expectError(result, "INVALID_PHASE_TRANSITION");
});

await test("LocalPhaseController - planning cannot go directly to result_preview", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.invalid_transition_planning_to_result);
  expectError(result, "INVALID_PHASE_TRANSITION");
});

await test("LocalPhaseController - result_preview cannot go back to battle_preview", async (t) => {
  const { invalid } = await loadFixtures();
  const result = advanceLocalPhase(invalid.invalid_transition_result_to_battle);
  expectError(result, "INVALID_PHASE_TRANSITION");
});
