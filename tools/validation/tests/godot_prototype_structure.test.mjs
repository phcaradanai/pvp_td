import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..", "..", "..");

const REQUIRED_FILES = [
  "godot_prototype/project.godot",
  "godot_prototype/README.md",
  "godot_prototype/scenes/pvp_flow_prototype.tscn",
  "godot_prototype/scripts/pvp_flow_state.gd",
  "godot_prototype/scripts/pvp_flow_view_model.gd",
  "godot_prototype/scripts/pvp_flow_controller.gd",
  "godot_prototype/data/sample_pvp_flow.json",
  "godot_prototype/tests/README.md",
];

const REQUIRED_SCREENS = [
  "arsenal_preview",
  "shared_pool_preview",
  "draft_preview",
  "planning_preview",
  "battle_preview",
  "result_preview",
  "reward_preview",
];

test("Godot prototype — required files exist", async (t) => {
  for (const rel of REQUIRED_FILES) {
    await t.test(rel, () => {
      const full = join(ROOT, rel);
      assert.ok(existsSync(full), `Missing: ${rel}`);
    });
  }
});

test("Godot prototype — sample_pvp_flow.json has all required screens", () => {
  const path = join(ROOT, "godot_prototype", "data", "sample_pvp_flow.json");
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  assert.ok(Array.isArray(data.screens), "screens must be an array");
  for (const screen of REQUIRED_SCREENS) {
    assert.ok(
      data.screens.includes(screen),
      `Missing screen in screens array: ${screen}`
    );
  }
  assert.equal(
    data.screens.length,
    REQUIRED_SCREENS.length,
    `Expected ${REQUIRED_SCREENS.length} screens, got ${data.screens.length}`
  );
});
