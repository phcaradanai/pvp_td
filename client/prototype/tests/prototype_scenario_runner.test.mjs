import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const visualDir = path.join(projectRoot, "client", "prototype", "visual");
const dataDir = path.join(projectRoot, "client", "prototype", "data");

await test("PrototypeScenarioRunner - sample_scenarios.json exists and is valid", async () => {
  const filePath = path.join(dataDir, "sample_scenarios.json");
  assert.ok(fs.existsSync(filePath), "sample_scenarios.json is missing");
  
  const scenarios = JSON.parse(fs.readFileSync(filePath, "utf8"));
  assert.ok(scenarios["basic_e2e_draw"], "basic_e2e_draw missing");
  assert.ok(scenarios["asymmetric_unlock_e2e_draw"], "asymmetric_unlock_e2e_draw missing");
  assert.ok(scenarios["player_a_wins_by_core_hp_override"], "player_a_wins_by_core_hp_override missing");
  assert.ok(scenarios["player_b_wins_by_core_hp_override"], "player_b_wins_by_core_hp_override missing");
});

await test("PrototypeScenarioRunner - app.js uses scenario selection logic", async () => {
  const js = fs.readFileSync(path.join(visualDir, "app.js"), "utf8");
  assert.ok(js.includes('sample_scenarios.json'), "Missing sample_scenarios reference");
  assert.ok(js.includes('scenario-selector'), "Missing scenario-selector reference");
  assert.ok(js.includes('handleScenarioChange'), "Missing handleScenarioChange logic");
});

await test("PrototypeScenarioRunner - index.html has scenario select", async () => {
  const html = fs.readFileSync(path.join(visualDir, "index.html"), "utf8");
  assert.ok(html.includes('id="scenario-selector"'), "Missing scenario-selector id");
});

await test("PrototypeScenarioRunner - styles.css has scenario styles", async () => {
  const css = fs.readFileSync(path.join(visualDir, "styles.css"), "utf8");
  assert.ok(css.includes('.scenario-select'), "Missing scenario-select styles");
  assert.ok(css.includes('.side-by-side'), "Missing side-by-side layout styles");
});

await test("PrototypeScenarioRunner - view model exposes new fields", async () => {
  const { createInitialPrototypeState } = await import("../src/prototype_state.js");
  const { buildPrototypeViewModel } = await import("../src/prototype_view_model.js");
  
  const scenarios = JSON.parse(fs.readFileSync(path.join(dataDir, "sample_scenarios.json"), "utf8"));
  const state = createInitialPrototypeState(scenarios["basic_e2e_draw"]);
  const vm = buildPrototypeViewModel(state);
  
  assert.ok(vm.arsenal_panel, "arsenal_panel missing");
  assert.ok(vm.phase_panel.history.length > 0, "phase history missing");
  assert.ok(vm.shared_pool_panel.categories[0].name, "shared pool not categorized properly");
});
