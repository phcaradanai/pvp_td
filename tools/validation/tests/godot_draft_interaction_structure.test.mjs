import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(".");
const CONTROLLER = resolve(ROOT, "godot_prototype/scripts/pvp_flow_controller.gd");
const STATE = resolve(ROOT, "godot_prototype/scripts/pvp_flow_state.gd");
const VIEW_MODEL = resolve(ROOT, "godot_prototype/scripts/pvp_flow_view_model.gd");
const SAMPLE_JSON = resolve(ROOT, "godot_prototype/data/sample_pvp_flow.json");

const controllerSrc = readFileSync(CONTROLLER, "utf8");
const stateSrc = readFileSync(STATE, "utf8");
const viewModelSrc = readFileSync(VIEW_MODEL, "utf8");
const sampleData = JSON.parse(readFileSync(SAMPLE_JSON, "utf8"));

test("pvp_flow_controller.gd contains pick_shared_pool_item", () => {
  assert.ok(controllerSrc.includes("pick_shared_pool_item"), "pick_shared_pool_item not found in controller");
});

test("pvp_flow_controller.gd contains lock_draft", () => {
  assert.ok(controllerSrc.includes("lock_draft"), "lock_draft not found in controller");
});

test("pvp_flow_controller.gd contains reset_draft", () => {
  assert.ok(controllerSrc.includes("reset_draft"), "reset_draft not found in controller");
});

test("pvp_flow_controller.gd contains can_advance_from_current_screen", () => {
  assert.ok(controllerSrc.includes("can_advance_from_current_screen"), "can_advance_from_current_screen not found in controller");
});

test("pvp_flow_controller.gd contains LockDraftButton", () => {
  assert.ok(controllerSrc.includes("LockDraftButton"), "LockDraftButton not found in controller");
});

test("pvp_flow_controller.gd uses .bind() for pool item button connections", () => {
  assert.ok(controllerSrc.includes(".bind(item_id)"), ".bind(item_id) not found — use .bind() not lambda for signal connections");
});

test("pvp_flow_controller.gd contains _rebuild_dynamic_content", () => {
  assert.ok(controllerSrc.includes("_rebuild_dynamic_content"), "_rebuild_dynamic_content not found in controller");
});

test("pvp_flow_state.gd contains draft_locked", () => {
  assert.ok(stateSrc.includes("draft_locked"), "draft_locked not found in state");
});

test("pvp_flow_state.gd contains current_drafter", () => {
  assert.ok(stateSrc.includes("current_drafter"), "current_drafter not found in state");
});

test("pvp_flow_state.gd contains draft_picks_a", () => {
  assert.ok(stateSrc.includes("draft_picks_a"), "draft_picks_a not found in state");
});

test("pvp_flow_state.gd contains draft_picks_b", () => {
  assert.ok(stateSrc.includes("draft_picks_b"), "draft_picks_b not found in state");
});

test("pvp_flow_state.gd contains pick_shared_pool_item", () => {
  assert.ok(stateSrc.includes("pick_shared_pool_item"), "pick_shared_pool_item not found in state");
});

test("pvp_flow_state.gd contains lock_draft", () => {
  assert.ok(stateSrc.includes("lock_draft"), "lock_draft not found in state");
});

test("pvp_flow_state.gd contains reset_draft", () => {
  assert.ok(stateSrc.includes("reset_draft"), "reset_draft not found in state");
});

test("pvp_flow_state.gd contains can_advance_from_current_screen", () => {
  assert.ok(stateSrc.includes("can_advance_from_current_screen"), "can_advance_from_current_screen not found in state");
});

test("pvp_flow_state.gd contains budget_max", () => {
  assert.ok(stateSrc.includes("budget_max"), "budget_max not found in state");
});

test("pvp_flow_state.gd contains budget_used_for", () => {
  assert.ok(stateSrc.includes("budget_used_for"), "budget_used_for not found in state");
});

test("pvp_flow_state.gd contains budget_remaining_for", () => {
  assert.ok(stateSrc.includes("budget_remaining_for"), "budget_remaining_for not found in state");
});

test("pvp_flow_view_model.gd contains pool_item_cards", () => {
  assert.ok(viewModelSrc.includes("pool_item_cards"), "pool_item_cards not found in view model");
});

test("pvp_flow_view_model.gd contains show_pool_items", () => {
  assert.ok(viewModelSrc.includes("show_pool_items"), "show_pool_items not found in view model");
});

test("pvp_flow_view_model.gd contains lock_draft_enabled", () => {
  assert.ok(viewModelSrc.includes("lock_draft_enabled"), "lock_draft_enabled not found in view model");
});

test("pvp_flow_view_model.gd build accepts feedback parameter", () => {
  assert.ok(viewModelSrc.includes("feedback: String"), "feedback parameter not found in view model build");
});

test("pvp_flow_view_model.gd contains _build_draft_panels", () => {
  assert.ok(viewModelSrc.includes("_build_draft_panels"), "_build_draft_panels not found in view model");
});

test("pvp_flow_view_model.gd contains _build_planning_panels", () => {
  assert.ok(viewModelSrc.includes("_build_planning_panels"), "_build_planning_panels not found in view model");
});

test("pvp_flow_view_model.gd contains _build_battle_panels", () => {
  assert.ok(viewModelSrc.includes("_build_battle_panels"), "_build_battle_panels not found in view model");
});

test("sample_pvp_flow.json has shared_pool key", () => {
  assert.ok(sampleData.shared_pool, "shared_pool key missing from sample_pvp_flow.json");
});

test("sample_pvp_flow.json shared_pool has budget_max of 10", () => {
  assert.strictEqual(sampleData.shared_pool.budget_max, 10);
});

test("sample_pvp_flow.json shared_pool has 6 items", () => {
  assert.strictEqual(sampleData.shared_pool.items.length, 6);
});

const REQUIRED_IDS = ["archer", "cannon", "scout", "mage", "tank", "fireball"];

for (const id of REQUIRED_IDS) {
  test(`sample_pvp_flow.json shared_pool contains item id "${id}"`, () => {
    const found = sampleData.shared_pool.items.some((item) => item.id === id);
    assert.ok(found, `Item id "${id}" not found in shared_pool.items`);
  });
}

test("all shared_pool items have id, name, category, cost fields", () => {
  for (const item of sampleData.shared_pool.items) {
    assert.ok(item.id, `Item missing id: ${JSON.stringify(item)}`);
    assert.ok(item.name, `Item missing name: ${JSON.stringify(item)}`);
    assert.ok(item.category, `Item missing category: ${JSON.stringify(item)}`);
    assert.ok(typeof item.cost === "number", `Item missing numeric cost: ${JSON.stringify(item)}`);
  }
});

test("sample_pvp_flow.json screens array is unchanged (7 screens)", () => {
  assert.strictEqual(sampleData.screens.length, 7);
});
