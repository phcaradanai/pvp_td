import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";

const projectRoot = process.cwd();

test("Godot Planning Placement Prototype Structure Tests", async (t) => {
  const statePath = path.join(projectRoot, "godot_prototype", "scripts", "pvp_flow_state.gd");
  const controllerPath = path.join(projectRoot, "godot_prototype", "scripts", "pvp_flow_controller.gd");
  const viewModelPath = path.join(projectRoot, "godot_prototype", "scripts", "pvp_flow_view_model.gd");
  const sampleDataPath = path.join(projectRoot, "godot_prototype", "data", "sample_pvp_flow.json");

  await t.test("pvp_flow_state.gd contains planning properties and methods", async () => {
    const code = await fs.readFile(statePath, "utf8");
    assert.ok(code.includes("var selected_planning_item"), "Missing selected_planning_item");
    assert.ok(code.includes("var placements_a"), "Missing placements_a");
    assert.ok(code.includes("var placements_b"), "Missing placements_b");
    assert.ok(code.includes("func can_place_item"), "Missing can_place_item");
    assert.ok(code.includes("func place_item"), "Missing place_item");
    assert.ok(code.includes("func is_planning_valid"), "Missing is_planning_valid");
    assert.ok(code.includes("func reset_planning"), "Missing reset_planning");
    assert.ok(code.includes("func build_battle_preview_from_placements"), "Missing build_battle_preview_from_placements");
  });

  await t.test("pvp_flow_controller.gd contains planning actions", async () => {
    const code = await fs.readFile(controllerPath, "utf8");
    assert.ok(code.includes("func select_planning_item"), "Missing select_planning_item");
    assert.ok(code.includes("func place_selected_item"), "Missing place_selected_item");
    assert.ok(code.includes("func reset_planning"), "Missing reset_planning");
    assert.ok(code.includes("is_planning_valid"), "Missing is_planning_valid logic in controller");
  });

  await t.test("pvp_flow_view_model.gd contains planning view properties", async () => {
    const code = await fs.readFile(viewModelPath, "utf8");
    assert.ok(code.includes("var show_planning_items"), "Missing show_planning_items");
    assert.ok(code.includes("var planning_items_a"), "Missing planning_items_a");
    assert.ok(code.includes("var planning_slots_a"), "Missing planning_slots_a");
    assert.ok(code.includes("static func _build_planning_items"), "Missing _build_planning_items");
    assert.ok(code.includes("static func _build_planning_slots"), "Missing _build_planning_slots");
    assert.ok(code.includes("_placements_to_combat_text"), "Missing _placements_to_combat_text");
  });

  await t.test("sample_pvp_flow.json contains planning_config", async () => {
    const dataRaw = await fs.readFile(sampleDataPath, "utf8");
    const data = JSON.parse(dataRaw);
    assert.ok(data.planning_config, "Missing planning_config in json");
    assert.ok(data.planning_config.defense_slot_count > 0, "Missing defense_slot_count");
    assert.ok(data.planning_config.send_lane_count > 0, "Missing send_lane_count");
    assert.ok(data.planning_config.spell_slot_count > 0, "Missing spell_slot_count");
    assert.equal(data.screens.length, 7, "Screens array should still have 7 items");
  });

  await t.test("planning spells integration", async () => {
    const stateCode = await fs.readFile(statePath, "utf8");
    assert.ok(stateCode.includes('"spells":'), "Missing spells placement key");
    assert.ok(stateCode.includes('slot_type == "spells" and cat != "spell"'), "Missing can_place_item spell rules");
    const vmCode = await fs.readFile(viewModelPath, "utf8");
    assert.ok(vmCode.includes('Spell:'), "Missing spell optional status");
    assert.ok(vmCode.includes('state.spell_slots'), "Missing spell slots builder");
    assert.ok(vmCode.includes('SPELLS:'), "Missing SPELLS in battle preview text");
  });
});
