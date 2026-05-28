// validate_data.mjs
import path from "path";
import { loadSampleCatalog } from "./src/catalog_loader.mjs";
import { loadJsonFile } from "./src/load_json.mjs";
import fs from "fs";

async function main() {
  const projectRoot = process.cwd(); // project root when script run via npm
  try {
    // Verify required draft fixture files exist
    const draftFixtures = [
      "draft.valid.sample.json",
      "draft.invalid.sample.json",
      "local_match.valid.sample.json",
      "local_match.invalid.sample.json",
      "local_phase.valid.sample.json",
      "local_phase.invalid.sample.json",
      "mock_result.valid.sample.json",
      "mock_result.invalid.sample.json"
    ];
    for (const file of draftFixtures) {
      const fp = path.join(projectRoot, "data", "samples", file);
      if (!fs.existsSync(fp)) {
        console.error(`Missing required fixture file: data/samples/${file}`);
        process.exit(1);
      }
    }

    const catalog = await loadSampleCatalog(projectRoot);
    // Validate unlock_tree grants_stat_advantage false and target ids exist
    let unlockErrors = [];
    for (const unlock of catalog.unlockTree) {
      if (unlock.grants_stat_advantage !== false) {
        unlockErrors.push({ code: "INVALID_UNLOCK", message: `Unlock ${unlock.id} grants stat advantage`, path: `unlock_tree[${unlock.id}]` });
      }
      if (unlock.target_id) {
        const exists = catalog.allItemsById.has(unlock.target_id);
        if (!exists) {
          unlockErrors.push({ code: "INVALID_UNLOCK_TARGET", message: `Target id ${unlock.target_id} not found for unlock ${unlock.id}`, path: `unlock_tree[${unlock.id}]` });
        }
      }
    }
    // Validate arsenal_rules structure
    const rules = catalog.arsenalRules;
    const requiredRuleFields = ["total_budget", "tower_slots", "creep_slots", "spell_slots", "relic_slots", "guardian_slots"];
    const missing = requiredRuleFields.filter(f => !(f in rules));
    if (missing.length) {
      console.error("Arsenal rules missing fields:", missing.join(", "));
      process.exit(1);
    }
    if (unlockErrors.length) {
      console.error("Unlock validation errors:");
      console.dir(unlockErrors, { depth: null });
      process.exit(1);
    }
    console.log("Data validation passed.");
    process.exit(0);
  } catch (e) {
    console.error("Data validation failed:", e.message);
    process.exit(1);
  }
}

main();
