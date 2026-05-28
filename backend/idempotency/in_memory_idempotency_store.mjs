function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

export function createInMemoryIdempotencyStore(seed = {}) {
  const records = new Map();

  for (const [key, record] of Object.entries(seed || {})) {
    records.set(key, clone(record));
  }

  return {
    getRecord(key) {
      return records.has(key) ? clone(records.get(key)) : null;
    },
    saveRecord(record) {
      const saved = clone(record);
      records.set(saved.key, saved);
      return clone(saved);
    }
  };
}
