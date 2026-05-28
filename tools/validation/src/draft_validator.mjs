// draft_validator.mjs
/**
 * Validate a player's final draft loadout.
 *
 * Input shape:
 * {
 *   player_id: string,
 *   shared_pool: { towers: [], creeps: [], spells: [], relics: [], guardians: [] },
 *   final_loadout: { towers: [], creeps: [], spells: [], relics: [], guardians: [] }
 * }
 *
 * Returns:
 * {
 *   ok: boolean,
 *   category_counts: { towers, creeps, spells, relics, guardians },
 *   errors: [{code, message, path}]
 * }
 */
export function validateDraft(input, catalog) {
  const errors = [];
  const categories = ["towers", "creeps", "spells", "relics", "guardians"];

  // ---------------------------------------------------
  // 1. Load draft rules
  // ---------------------------------------------------
  const draftRules = catalog.draftRules;
  if (!draftRules || !draftRules.final_loadout) {
    errors.push({
      code: "INVALID_DRAFT_RULES",
      message: "Draft rules missing or final_loadout not defined",
      path: "draft_rules",
    });
    return { ok: false, category_counts: {}, errors };
  }

  // ---------------------------------------------------
  // 2. Verify required sections exist
  // ---------------------------------------------------
  if (!input || typeof input !== "object") {
    errors.push({
      code: "INVALID_DRAFT_RULES",
      message: "Input object is missing or malformed",
      path: "input",
    });
    return { ok: false, category_counts: {}, errors };
  }

  if (!input.shared_pool) {
    errors.push({ code: "MISSING_SHARED_POOL", message: "shared_pool missing", path: "shared_pool" });
  }
  if (!input.final_loadout) {
    errors.push({ code: "MISSING_FINAL_LOADOUT", message: "final_loadout missing", path: "final_loadout" });
  }
  if (errors.length) {
    return { ok: false, category_counts: {}, errors };
  }

  // ---------------------------------------------------
  // 3. Validate category keys in final_loadout
  // ---------------------------------------------------
  for (const key of Object.keys(input.final_loadout)) {
    if (!categories.includes(key)) {
      errors.push({
        code: "INVALID_CATEGORY",
        message: `Category ${key} is not allowed`,
        path: `final_loadout.${key}`,
      });
    }
  }

  // ---------------------------------------------------
  // 4. Validate each pick
  // ---------------------------------------------------
  const seenIds = new Set();
  const allItems = catalog.allItemsById;

  for (const cat of categories) {
    const sharedIds = (input.shared_pool[cat] || []);
    const picks = (input.final_loadout[cat] || []);
    for (const id of picks) {
      // Outside shared pool
      if (!sharedIds.includes(id)) {
        errors.push({
          code: "PICK_OUTSIDE_SHARED_POOL",
          message: `Item ${id} not in shared_pool.${cat}`,
          path: `final_loadout.${cat}`,
        });
        continue; // still continue to collect other errors
      }
      // Unknown item id
      if (!allItems.has(id)) {
        errors.push({
          code: "UNKNOWN_ITEM_ID",
          message: `Item id ${id} not found in catalog`,
          path: `final_loadout.${cat}`,
        });
        continue;
      }
      const item = allItems.get(id);
      // Disabled item
      if (!item.enabled) {
        errors.push({
          code: "DISABLED_ITEM",
          message: `Item ${id} is disabled`,
          path: `final_loadout.${cat}`,
        });
      }
      // Duplicate pick (must be unique across final_loadout)
      const dupKey = `${cat}:${id}`;
      if (seenIds.has(dupKey)) {
        errors.push({
          code: "DUPLICATE_PICK",
          message: `Duplicate pick of ${id} in category ${cat}`,
          path: `final_loadout.${cat}`,
        });
      } else {
        seenIds.add(dupKey);
      }
    }
  }

  // ---------------------------------------------------
  // 5. Slot count validation using draftRules.final_loadout
  // ---------------------------------------------------
  const slotSpec = draftRules.final_loadout;
  const categoryCounts = {};
  for (const cat of categories) {
    const count = (input.final_loadout[cat] || []).length;
    categoryCounts[cat] = count;
    const ruleKey = `${cat.slice(0, -1)}_slots`; // towers -> tower_slots
    const rule = slotSpec[ruleKey];

    let min = 0, max = Infinity;
    if (typeof rule === "number") {
      max = rule;
    } else if (typeof rule === "object" && rule !== null) {
      min = rule.min ?? 0;
      max = rule.max ?? Infinity;
    }

    // For relics/guardians, missing min defaults to 0 (already set)
    if (count < min) {
      errors.push({
        code: `TOO_FEW_FINAL_${cat.toUpperCase()}`,
        message: `Final loadout requires at least ${min} ${cat}`,
        path: `final_loadout.${cat}`,
      });
    }
    if (count > max) {
      errors.push({
        code: `TOO_MANY_FINAL_${cat.toUpperCase()}`,
        message: `Final loadout allows at most ${max} ${cat}`,
        path: `final_loadout.${cat}`,
      });
    }
  }

  const ok = errors.length === 0;
  return { ok, category_counts: categoryCounts, errors };
}

export default { validateDraft };
