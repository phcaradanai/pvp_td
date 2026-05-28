// shared_pool_builder.mjs
import { validateArsenal } from "./arsenal_cost_validator.mjs";

/**
 * Build a deterministic shared pool from two player arsenals.
 * @param {object} input - {player_a, player_b}
 * @param {object} catalog - loaded catalog containing allItemsById and draftRules.
 * @returns {object} result as described in the spec.
 */
export function buildSharedPool(input, catalog) {
  const errors = [];

  // Validate players in order A then B
  const playerAResult = validateArsenal(input.player_a, catalog);
  const ignoreCodes = new Set(['LOCKED_ITEM']);
  const playerAFiltered = playerAResult.errors.filter(e => {
    return !(e.code && (e.code.startsWith('TOO_') || ignoreCodes.has(e.code)));
  });
  if (!playerAResult.ok && playerAFiltered.length > 0) {
    errors.push({
      code: "PLAYER_A_INVALID_ARSENAL",
      message: "Player A arsenal is invalid",
      path: "player_a.arsenal",
      details: playerAFiltered
    });
    return { ok: false, shared_pool: null, sources: {}, errors };
  }
  const playerBResult = validateArsenal(input.player_b, catalog);
  const playerBFiltered = playerBResult.errors.filter(e => {
    return !(e.code && (e.code.startsWith('TOO_') || ignoreCodes.has(e.code)));
  });
  if (!playerBResult.ok && playerBFiltered.length > 0) {
    errors.push({
      code: "PLAYER_B_INVALID_ARSENAL",
      message: "Player B arsenal is invalid",
      path: "player_b.arsenal",
      details: playerBFiltered
    });
    return { ok: false, shared_pool: null, sources: {}, errors };
  }

  // Load draft rules
  const draftRules = catalog.draftRules;
  if (!draftRules || !draftRules.shared_pool_rules) {
    errors.push({
      code: "MISSING_DRAFT_RULES",
      message: "Draft rules or shared_pool_rules missing",
      path: "draft_rules",
      details: []
    });
    return { ok: false, shared_pool: null, sources: {}, errors };
  }
  const spRules = draftRules.shared_pool_rules;

  // Prepare empty pool structure
  const categories = ["towers", "creeps", "spells", "relics", "guardians"];
  const sharedPool = {};
  const sources = {};
  categories.forEach(cat => {
    sharedPool[cat] = [];
  });

  // Helper to add an item to pool and sources
  const addItem = (cat, id, sourceTag) => {
    if (!sources[id]) sources[id] = [];
    if (sourceTag && !sources[id].includes(sourceTag)) sources[id].push(sourceTag);
    sharedPool[cat].push(id);
  };

  // 1. Base pool (if enabled)
  if (spRules.include_base_pool) {
    const base = spRules.base_pool || {};
    for (const cat of categories) {
      const ids = base[cat] || [];
      for (const id of ids) {
        const item = catalog.allItemsById.get(id);
        if (!item) {
          errors.push({ code: "BASE_POOL_ITEM_NOT_FOUND", message: `Base pool item ${id} not found`, path: `shared_pool_rules.base_pool.${cat}`, details: [] });
          return { ok: false, shared_pool: null, sources: {}, errors };
        }
        if (!item.enabled) {
          errors.push({ code: "BASE_POOL_ITEM_DISABLED", message: `Base pool item ${id} disabled`, path: `shared_pool_rules.base_pool.${cat}`, details: [] });
          return { ok: false, shared_pool: null, sources: {}, errors };
        }
        // Add base pool items without recording a source tag
        addItem(cat, id, null);
      }
    }
  }

  // 2. Player arsenals
  const addPlayerItems = (player, tag) => {
    const ars = player.arsenal || {};
    for (const cat of categories) {
      const ids = ars[cat] || [];
      for (const id of ids) {
        addItem(cat, id, tag);
      }
    }
  };
  addPlayerItems(input.player_a, "player_a");
  addPlayerItems(input.player_b, "player_b");

  // 3. Reveal all items (optional)
  if (spRules.reveal_all_items) {
    for (const [id, item] of catalog.allItemsById.entries()) {
      if (!item.enabled) continue;
      const cat = item.category; // expected to be one of the categories
      if (!cat || !categories.includes(cat)) continue;
      addItem(cat, id, "catalog");
    }
  }

  // 4. Duplicate handling
  if (spRules.remove_duplicates) {
    for (const cat of categories) {
      const seen = new Set();
      const deduped = [];
      for (const id of sharedPool[cat]) {
        if (!seen.has(id)) {
          seen.add(id);
          deduped.push(id);
        }
      }
      sharedPool[cat] = deduped;
    }
  }

  // 5. Deterministic ordering (alphabetical)
  for (const cat of categories) {
    sharedPool[cat] = sharedPool[cat].slice().sort();
  }
  // Sort source arrays
  for (const id of Object.keys(sources)) {
    sources[id] = sources[id].slice().sort();
  }

  return { ok: true, shared_pool: sharedPool, sources, errors: [] };
}

export default { buildSharedPool };
