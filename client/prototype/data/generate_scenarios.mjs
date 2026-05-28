import fs from "fs";
import path from "path";
import { runLocalE2ELoop } from "../../../tools/validation/src/local_e2e_loop_harness.mjs";
import { loadSampleCatalog } from "../../../tools/validation/src/catalog_loader.mjs";
import { loadJsonFile } from "../../../tools/validation/src/load_json.mjs";

const projectRoot = process.cwd();

async function generate() {
  const e2eInputPath = path.join(projectRoot, "data", "samples", "local_e2e.valid.sample.json");
  const inputs = await loadJsonFile(e2eInputPath);
  const catalog = await loadSampleCatalog(projectRoot);
  
  const scenarios = {};
  
  for (const [key, input] of Object.entries(inputs)) {
    const res = runLocalE2ELoop(input, catalog);
    if (!res.ok) {
      console.error(`Failed to generate scenario ${key}`, res.errors);
      continue;
    }
    
    // We want the final state for the client to read
    scenarios[key] = {
      players: res.final_match_state.players,
      shared_pool: res.final_match_state.shared_pool,
      phase: res.final_match_state.phase,
      action_log: res.final_match_state.action_log,
      core_hp: res.final_match_state.core_hp,
      
      // Also inject the initial arsenals so the client UI can show them side-by-side
      initial_arsenals: {
        player_a: input.player_a.arsenal,
        player_b: input.player_b.arsenal
      }
    };
  }
  
  const outPath = path.join(projectRoot, "client", "prototype", "data", "sample_scenarios.json");
  fs.writeFileSync(outPath, JSON.stringify(scenarios, null, 2));
  console.log("Generated sample_scenarios.json");
}

generate().catch(console.error);
