import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { createInitialPrototypeState } from "../src/prototype_state.js";
import { advancePrototypeScreen } from "../src/prototype_flow.js";
import { buildPrototypeViewModel } from "../src/prototype_view_model.js";

const projectRoot = process.cwd();

test("Prototype Reward Screen tests", async (t) => {
  const dataPath = path.join(projectRoot, "client", "prototype", "data", "sample_reward_preview.json");
  const dataRaw = await fs.readFile(dataPath, "utf8");
  const data = JSON.parse(dataRaw);
  
  await t.test("sample_reward_preview.json exists", () => {
    assert.ok(data);
    assert.ok(data.draw_reward_preview);
  });

  const state = createInitialPrototypeState(data.cosmetic_unlock_preview);
  state.current_screen = "result_preview"; // mock advance to result_preview

  await t.test("prototype flow supports SHOW_REWARD_PREVIEW", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    assert.ok(res.ok);
    assert.equal(res.state.current_screen, "reward_preview");
  });

  await t.test("reward_preview cannot advance further with Next", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    const rewardState = res.state;
    // Trying any action from reward_preview should fail unless it's RESET
    const failRes = advancePrototypeScreen(rewardState, { type: "SHOW_SOMETHING_ELSE" });
    assert.equal(failRes.ok, false);
  });

  await t.test("reset from reward_preview returns to arsenal_preview", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    const rewardState = res.state;
    const resetRes = advancePrototypeScreen(rewardState, { type: "RESET_PROTOTYPE" });
    assert.ok(resetRes.ok);
    assert.equal(resetRes.state.current_screen, "arsenal_preview");
  });

  await t.test("view model exposes reward_panel", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    const vm = buildPrototypeViewModel(res.state);
    assert.ok(vm.reward_panel);
    assert.equal(vm.reward_panel.rewards.player_a.xp_delta, 100);
    assert.ok(vm.reward_panel.new_unlocks.player_a.includes("cosmetic_aura_blue"));
  });

  await t.test("reward_panel includes backend authority note", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    const vm = buildPrototypeViewModel(res.state);
    const notes = vm.reward_panel.notes.join(" ");
    assert.ok(notes.includes("Production rewards must be confirmed by backend"));
  });

  await t.test("reward_panel includes no permanent PvP stat advantage note", () => {
    const res = advancePrototypeScreen(state, { type: "SHOW_REWARD_PREVIEW" });
    const vm = buildPrototypeViewModel(res.state);
    const notes = vm.reward_panel.notes.join(" ");
    assert.ok(notes.includes("No permanent PvP stat advantage"));
  });

  await t.test("input is not mutated", () => {
    const input = JSON.parse(JSON.stringify(state));
    const inputStr = JSON.stringify(input);
    advancePrototypeScreen(input, { type: "SHOW_REWARD_PREVIEW" });
    assert.equal(JSON.stringify(input), inputStr);
  });
  
  await t.test("visual app references reward preview rendering", async () => {
    const appPath = path.join(projectRoot, "client", "prototype", "visual", "app.js");
    const appSource = await fs.readFile(appPath, "utf8");
    assert.ok(appSource.includes("reward_preview"));
    assert.ok(appSource.includes("reward_panel"));
  });

  await t.test("styles.css contains reward screen classes", async () => {
    const stylesPath = path.join(projectRoot, "client", "prototype", "visual", "styles.css");
    const stylesSource = await fs.readFile(stylesPath, "utf8");
    assert.ok(stylesSource.includes(".reward-details"));
    assert.ok(stylesSource.includes(".unlock-chip"));
  });
});
