// arsenal_cost_validator.mjs
import { loadJsonFile } from "./load_json.mjs";
/**
 * Validate a player's arsenal against rules and catalog.
 * @param {object} input Player arsenal input.
 * @param {object} catalog Loaded catalog from catalog_loader.
 * @returns {object} Validation result.
 */
export function validateArsenal(input, catalog) {
  const errors = [];
  const { arsenal, unlocked_ids = [] } = input;
  const rules = catalog.arsenalRules;
  if (!rules) {
    return { ok: false, errors: [{ code: "INVALID_RULES", message: "Missing arsenal rules", path: "arsenalRules" }], total_cost: 0, category_counts: {} };
  }
  const categories = ["towers", "creeps", "spells", "relics", "guardians"];
  const counts = {};
  let totalCost = 0;
  const seenIds = new Set();
  // Helper to add error
  const addError = (code, message, path) => errors.push({ code, message, path });

  // Validate categories exist
  for (const cat of Object.keys(arsenal)) {
    if (!categories.includes(cat)) {
      addError("INVALID_CATEGORY", `Invalid category ${cat}`, `arsenal.${cat}`);
    }
  }
  // Ensure required categories (if any) - none required by spec, but could be defined; skipping.

  // Process each category
  for (const cat of categories) {
    const items = arsenal[cat] || [];
    counts[cat] = items.length;
    const slotRule = rules[`${cat.slice(0, -1)}_slots`]; // e.g., tower_slots
    if (slotRule) {
      if (items.length < slotRule.min) {
        addError(`TOO_FEW_${cat.toUpperCase()}`, `Too few ${cat}: ${items.length} < min ${slotRule.min}`, `arsenal.${cat}`);
      }
      if (items.length > slotRule.max) {
        addError(`TOO_MANY_${cat.toUpperCase()}`, `Too many ${cat}: ${items.length} > max ${slotRule.max}`, `arsenal.${cat}`);
      }
    }
    // Validate each selected id
    for (const id of items) {
      // duplicate check
      if (seenIds.has(id)) {
        if (!rules.duplicate_rules?.allow_duplicates) {
          addError("DUPLICATE_ITEM", `Duplicate item id ${id}",`,
            `arsenal.${cat}`);
        }
      }
      seenIds.add(id);
      const item = catalog.allItemsById.get(id);
      if (!item) {
        addError("UNKNOWN_ITEM_ID", `Unknown item id ${id}`, `arsenal.${cat}`);
        continue;
      }
      // disabled check
      if (!item.enabled) {
        addError("DISABLED_ITEM", `Item ${id} is disabled`, `arsenal.${cat}`);
      }
      // locked check (player must have unlock)
      if (item.unlock_id && !unlocked_ids.includes(item.unlock_id)) {
        addError("LOCKED_ITEM", `Item ${id} is locked (requires ${item.unlock_id})`, `arsenal.${cat}`);
      }
      // cost validation
      const cost = item.arsenal_cost;
      if (typeof cost !== "number" || cost < 0) {
        addError("INVALID_COST", `Invalid cost for item ${id}",`,
          `arsenal.${cat}`);
      } else {
        totalCost += cost;
      }
    }
  }

  if (totalCost > (rules.total_budget ?? Infinity)) {
    addError("OVER_BUDGET", `Arsenal cost ${totalCost} exceeds budget ${rules.total_budget}",`,
      "arsenal");
  }

  const ok = errors.length === 0;
  return { ok, total_cost: totalCost, category_counts: counts, errors };
}

export default { validateArsenal };
