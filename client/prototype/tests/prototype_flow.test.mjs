import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { createInitialPrototypeState } from "../src/prototype_state.js";
import { advancePrototypeScreen } from "../src/prototype_flow.js";
import { buildPrototypeViewModel } from "../src/prototype_view_model.js";

const projectRoot = process.cwd();

function loadSample() {
  const filePath = path.join(projectRoot, "client", "prototype", "data", "sample_local_e2e_state.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

await test("PrototypeFlow - createInitialPrototypeState creates arsenal_preview state", async () => {
  const sample = loadSample();
  const state = createInitialPrototypeState(sample);
  
  assert.strictEqual(state.current_screen, "arsenal_preview");
  assert.strictEqual(state.player_a.player_id, "player_a");
  assert.ok(state.shared_pool.towers.includes("fire_tower"));
  assert.ok(state.final_drafts.player_a);
  assert.strictEqual(state.phase, "result_preview");
  assert.strictEqual(state.mock_result.is_draw, true);
});

await test("PrototypeFlow - valid flow advances correctly", async () => {
  const sample = loadSample();
  let state = createInitialPrototypeState(sample);
  
  let result = advancePrototypeScreen(state, { type: "SHOW_SHARED_POOL_PREVIEW" });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.state.current_screen, "shared_pool_preview");
  state = result.state;

  result = advancePrototypeScreen(state, { type: "SHOW_DRAFT_PREVIEW" });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.state.current_screen, "draft_preview");
  state = result.state;

  result = advancePrototypeScreen(state, { type: "SHOW_PHASE_FLOW_PREVIEW" });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.state.current_screen, "phase_flow_preview");
  state = result.state;

  result = advancePrototypeScreen(state, { type: "SHOW_RESULT_PREVIEW" });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.state.current_screen, "result_preview");
  state = result.state;
});

await test("PrototypeFlow - reset returns to arsenal_preview", async () => {
  const sample = loadSample();
  let state = createInitialPrototypeState(sample);
  state = advancePrototypeScreen(state, { type: "SHOW_SHARED_POOL_PREVIEW" }).state;
  
  const result = advancePrototypeScreen(state, { type: "RESET_PROTOTYPE" });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.state.current_screen, "arsenal_preview");
});

await test("PrototypeFlow - invalid transition fails", async () => {
  const sample = loadSample();
  const state = createInitialPrototypeState(sample); // arsenal_preview
  
  const result = advancePrototypeScreen(state, { type: "SHOW_RESULT_PREVIEW" });
  assert.strictEqual(result.ok, false);
  const hasError = result.errors.some(e => e.code === "INVALID_PROTOTYPE_SCREEN_TRANSITION");
  assert.ok(hasError);
});

await test("PrototypeFlow - invalid action fails", async () => {
  const sample = loadSample();
  const state = createInitialPrototypeState(sample);
  
  const result = advancePrototypeScreen(state, { type: "UNKNOWN_ACTION" });
  assert.strictEqual(result.ok, false);
  const hasError = result.errors.some(e => e.code === "INVALID_PROTOTYPE_ACTION");
  assert.ok(hasError);
});

await test("PrototypeFlow - input is not mutated", async () => {
  const sample = loadSample();
  const state = createInitialPrototypeState(sample);
  const originalState = JSON.parse(JSON.stringify(state));
  
  advancePrototypeScreen(state, { type: "SHOW_SHARED_POOL_PREVIEW" });
  assert.deepStrictEqual(state, originalState);
});

await test("PrototypeFlow - buildPrototypeViewModel returns expected sections", async () => {
  const sample = loadSample();
  const state = createInitialPrototypeState(sample);
  const vm = buildPrototypeViewModel(state);
  
  assert.ok(vm);
  assert.strictEqual(vm.header.title, "Arsenal Preview");
  assert.ok(vm.player_panels.player_a);
  assert.strictEqual(vm.shared_pool_panel.total_items, 7);
  assert.strictEqual(vm.result_panel.winner, "Draw");
});
