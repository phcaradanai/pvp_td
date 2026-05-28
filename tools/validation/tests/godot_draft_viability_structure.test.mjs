import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(".");
const CONTROLLER = resolve(ROOT, "godot_prototype/scripts/pvp_flow_controller.gd");
const STATE = resolve(ROOT, "godot_prototype/scripts/pvp_flow_state.gd");
const VIEW_MODEL = resolve(ROOT, "godot_prototype/scripts/pvp_flow_view_model.gd");
const SCENE = resolve(ROOT, "godot_prototype/scenes/pvp_flow_prototype.tscn");

const controllerSrc = readFileSync(CONTROLLER, "utf8");
const stateSrc = readFileSync(STATE, "utf8");
const viewModelSrc = readFileSync(VIEW_MODEL, "utf8");
const sceneSrc = readFileSync(SCENE, "utf8");

// pvp_flow_state.gd viability methods
test("pvp_flow_state.gd contains can_pick_item_without_breaking_draft", () => {
  assert.ok(stateSrc.includes("can_pick_item_without_breaking_draft"), "can_pick_item_without_breaking_draft not found in state");
});

test("pvp_flow_state.gd contains is_draft_deadlocked", () => {
  assert.ok(stateSrc.includes("is_draft_deadlocked"), "is_draft_deadlocked not found in state");
});

test("pvp_flow_state.gd contains get_player_requirement_status", () => {
  assert.ok(stateSrc.includes("get_player_requirement_status"), "get_player_requirement_status not found in state");
});

test("pvp_flow_state.gd contains get_remaining_available_items", () => {
  assert.ok(stateSrc.includes("get_remaining_available_items"), "get_remaining_available_items not found in state");
});

test("pvp_flow_state.gd contains is_draft_completable_after_pick", () => {
  assert.ok(stateSrc.includes("is_draft_completable_after_pick"), "is_draft_completable_after_pick not found in state");
});

test("pvp_flow_state.gd contains _picks_status", () => {
  assert.ok(stateSrc.includes("_picks_status"), "_picks_status not found in state");
});

test("pvp_flow_state.gd pick_shared_pool_item calls can_pick_item_without_breaking_draft", () => {
  const pickFn = stateSrc.slice(stateSrc.indexOf("func pick_shared_pool_item"));
  const endIdx = pickFn.indexOf("\nfunc ", 1);
  const body = endIdx > 0 ? pickFn.slice(0, endIdx) : pickFn.slice(0, 600);
  assert.ok(body.includes("can_pick_item_without_breaking_draft"), "pick_shared_pool_item does not call viability guard");
});

test("pvp_flow_state.gd is_draft_deadlocked checks affordable and viable picks", () => {
  const deadlockFn = stateSrc.slice(stateSrc.indexOf("func is_draft_deadlocked"));
  const endIdx = deadlockFn.indexOf("\nfunc ", 1);
  const body = endIdx > 0 ? deadlockFn.slice(0, endIdx) : deadlockFn.slice(0, 400);
  assert.ok(body.includes("can_pick_item_without_breaking_draft"), "is_draft_deadlocked does not check viability");
});

// pvp_flow_view_model.gd viability fields
test("pvp_flow_view_model.gd contains draft_status_text field", () => {
  assert.ok(viewModelSrc.includes("draft_status_text"), "draft_status_text not found in view model");
});

test("pvp_flow_view_model.gd contains viable in pool_item_cards", () => {
  assert.ok(viewModelSrc.includes('"viable"'), '"viable" key not found in view model pool_item_cards');
});

test("pvp_flow_view_model.gd contains _build_draft_status_text", () => {
  assert.ok(viewModelSrc.includes("_build_draft_status_text"), "_build_draft_status_text not found in view model");
});

test("pvp_flow_view_model.gd contains _missing_requirements_text", () => {
  assert.ok(viewModelSrc.includes("_missing_requirements_text"), "_missing_requirements_text not found in view model");
});

test("pvp_flow_view_model.gd contains _req_status_text", () => {
  assert.ok(viewModelSrc.includes("_req_status_text"), "_req_status_text not found in view model");
});

test("pvp_flow_view_model.gd deadlock message contains Reset draft", () => {
  assert.ok(viewModelSrc.includes("Reset draft"), "deadlock message not found in view model");
});

test("pvp_flow_view_model.gd exposes get_player_requirement_status call", () => {
  assert.ok(viewModelSrc.includes("get_player_requirement_status"), "get_player_requirement_status not called in view model");
});

test("pvp_flow_view_model.gd calls is_draft_deadlocked", () => {
  assert.ok(viewModelSrc.includes("is_draft_deadlocked"), "is_draft_deadlocked not called in view model");
});

// pvp_flow_controller.gd DraftStatusLabel
test("pvp_flow_controller.gd contains _draft_status_label", () => {
  assert.ok(controllerSrc.includes("_draft_status_label"), "_draft_status_label not found in controller");
});

test("pvp_flow_controller.gd sets draft_status_label text from vm.draft_status_text", () => {
  assert.ok(controllerSrc.includes("draft_status_text"), "draft_status_text not bound in controller");
});

test("pvp_flow_controller.gd shows warning indicator for non-viable affordable items", () => {
  assert.ok(controllerSrc.includes("viable") && controllerSrc.includes("⚠"), "viability warning indicator not found in controller");
});

test("pvp_flow_controller.gd disables button only for drafted or not affordable (not for viability alone)", () => {
  const rebuildFn = controllerSrc.slice(controllerSrc.indexOf("func _rebuild_pool_buttons"));
  const endIdx = rebuildFn.indexOf("\nfunc ", 1);
  const body = endIdx > 0 ? rebuildFn.slice(0, endIdx) : rebuildFn;
  assert.ok(body.includes('card["drafted"] or not card["affordable"]'), "button disabled logic should only check drafted and affordable");
});

// pvp_flow_prototype.tscn DraftStatusLabel node
test("pvp_flow_prototype.tscn contains DraftStatusLabel node", () => {
  assert.ok(sceneSrc.includes("DraftStatusLabel"), "DraftStatusLabel not found in scene");
});

test("pvp_flow_prototype.tscn DraftStatusLabel is child of MainLayout/Controls", () => {
  assert.ok(sceneSrc.includes('parent="MainLayout/Controls"') && sceneSrc.includes("DraftStatusLabel"), "DraftStatusLabel not under Controls in scene");
});
