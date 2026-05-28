// catalog_loader.mjs
import path from "path";
import { loadJsonFile } from "./load_json.mjs";

/**
 * Load all sample data and build lookup maps.
 * @param {string} projectRoot Absolute path to project root.
 * @returns {Promise<object>} Catalog object containing maps.
 */
export async function loadSampleCatalog(projectRoot) {
  const samplesDir = path.join(projectRoot, "data", "samples");
  const requiredFiles = [
    "towers.sample.json",
    "creeps.sample.json",
    "spells.sample.json",
    "relics.sample.json",
    "guardians.sample.json",
    "arsenal_rules.sample.json",
    "unlock_tree.sample.json",
    "draft_rules.sample.json",
    "reward_rules.sample.json"
  ];

  const load = async (file) => {
    const fp = path.join(samplesDir, file);
    try {
      return await loadJsonFile(fp);
    } catch (e) {
      throw new Error(`Failed to load required sample file ${file}: ${e.message}`);
    }
  };

  const [towers, creeps, spells, relics, guardians, arsenalRules, unlock_tree, draftRules, reward_rules] = await Promise.all(
    requiredFiles.map(load)
  );

  // Helper to detect duplicate ids
  const detectDuplicates = (items, name) => {
    const seen = new Set();
    for (const it of items) {
      if (seen.has(it.id)) {
        throw new Error(`Duplicate id "${it.id}" found in ${name}`);
      }
      seen.add(it.id);
    }
  };

  detectDuplicates(towers, "towers.sample.json");
  detectDuplicates(creeps, "creeps.sample.json");
  detectDuplicates(spells, "spells.sample.json");
  detectDuplicates(relics, "relics.sample.json");
  detectDuplicates(guardians, "guardians.sample.json");

  const toMap = (arr) => {
    const m = new Map();
    for (const it of arr) {
      m.set(it.id, it);
    }
    return m;
  };

  const towersById = toMap(towers);
  const creepsById = toMap(creeps);
  const spellsById = toMap(spells);
  const relicsById = toMap(relics);
  const guardiansById = toMap(guardians);

  const allItemsById = new Map();
  for (const m of [towersById, creepsById, spellsById, relicsById, guardiansById]) {
    for (const [id, item] of m) {
      allItemsById.set(id, item);
    }
  }

  return {
    towersById,
    creepsById,
    spellsById,
    relicsById,
    guardiansById,
    allItemsById,
    arsenalRules,
    unlock_tree,
    draftRules,
    reward_rules,
  };
}

export default { loadSampleCatalog };
