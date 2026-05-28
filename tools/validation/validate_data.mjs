// validate_data.mjs
import path from "path";
import { loadSampleCatalog } from "./src/catalog_loader.mjs";
import { loadJsonFile } from "./src/load_json.mjs";
import fs from "fs";

async function main() {
  const projectRoot = process.cwd();
  const samplesDir = path.join(projectRoot, "data", "samples");
  
  try {
    const requiredFiles = [
      "arsenal_rules.sample.json",
      "creeps.sample.json",
      "guardians.sample.json",
      "relics.sample.json",
      "spells.sample.json",
      "towers.sample.json",
      "draft_rules.sample.json",
      "unlock_tree.sample.json",
      "reward_rules.sample.json",
      "shared_pool.valid.sample.json",
      "shared_pool.invalid.sample.json",
      "arsenals.valid.sample.json",
      "arsenals.invalid.sample.json",
      "draft.valid.sample.json",
      "draft.invalid.sample.json",
      "local_match.valid.sample.json",
      "local_match.invalid.sample.json",
      "local_phase.valid.sample.json",
      "local_phase.invalid.sample.json",
      "mock_result.valid.sample.json",
      "mock_result.invalid.sample.json",
      "local_e2e.valid.sample.json",
      "local_e2e.invalid.sample.json",
      "reward_mock.valid.sample.json",
      "reward_mock.invalid.sample.json",
      "backend_contract.valid.sample.json",
      "backend_contract.invalid.sample.json"
    ];

    for (const file of requiredFiles) {
      const p = path.join(samplesDir, file);
      if (!fs.existsSync(p)) {
        console.error(`Missing required sample file: ${file}`);
        process.exit(1);
      }
    }

    const catalog = await loadSampleCatalog(projectRoot);

    // 1. Uniqueness check across all IDs is already handled by catalog_loader.mjs detectDuplicates
    // We just need to verify target_ids exist in allItemsById
    
    // 2. Unlock targets exist and no stat advantage
    for (const node of catalog.unlock_tree) {
      if (node.grants_stat_advantage) {
        console.error(`Unlock node ${node.id} illegally grants PvP stat advantage.`);
        process.exit(1);
      }
      if (node.type !== "cosmetic" && node.type !== "profile" && node.type !== "mastery") {
        if (!catalog.allItemsById.has(node.target_id)) {
          console.error(`Unlock node ${node.id} targets unknown ID: ${node.target_id}`);
          process.exit(1);
        }
      }
    }

    // 3. Reward rules exist
    if (!catalog.reward_rules || !catalog.reward_rules.win || !catalog.reward_rules.draw || !catalog.reward_rules.participation) {
      console.error(`Reward rules are missing required win/draw/participation blocks.`);
      process.exit(1);
    }

    // Validate arsenal_rules structure
    const rules = catalog.arsenalRules;
    const requiredRuleFields = ["total_budget", "tower_slots", "creep_slots", "spell_slots", "relic_slots", "guardian_slots"];
    const missing = requiredRuleFields.filter(f => !(f in rules));
    if (missing.length) {
      console.error("Arsenal rules missing fields:", missing.join(", "));
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
