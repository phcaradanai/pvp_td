import { createIdempotencyError } from "./idempotency_errors.mjs";

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(item => normalize(item));
  if (!isObject(value)) return value;

  const normalized = {};
  for (const key of Object.keys(value).sort()) {
    normalized[key] = normalize(value[key]);
  }
  return normalized;
}

function hasStoreMethods(store) {
  return store && typeof store.getRecord === "function" && typeof store.saveRecord === "function";
}

export function buildRequestFingerprint(input) {
  return JSON.stringify(normalize(input));
}

export function checkIdempotency(input, store) {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      mode: null,
      fingerprint: null,
      stored_response: null,
      errors: [createIdempotencyError("INVALID_IDEMPOTENCY_INPUT", "Input must be a non-null object", "input")]
    };
  }

  if (!hasStoreMethods(store)) {
    return {
      ok: false,
      mode: null,
      fingerprint: null,
      stored_response: null,
      errors: [createIdempotencyError("INVALID_IDEMPOTENCY_STORE", "Store must provide getRecord and saveRecord", "store")]
    };
  }

  if (!input.idempotency_key) {
    return {
      ok: false,
      mode: null,
      fingerprint: null,
      stored_response: null,
      errors: [createIdempotencyError("MISSING_IDEMPOTENCY_KEY", "idempotency_key is required", "idempotency_key")]
    };
  }

  if (input.request_payload === undefined || input.request_payload === null) {
    return {
      ok: false,
      mode: null,
      fingerprint: null,
      stored_response: null,
      errors: [createIdempotencyError("MISSING_REQUEST_PAYLOAD", "request_payload is required", "request_payload")]
    };
  }

  const fingerprint = buildRequestFingerprint(input.request_payload);
  const existing = store.getRecord(input.idempotency_key);

  if (!existing) {
    return {
      ok: true,
      mode: "new",
      fingerprint,
      stored_response: null,
      errors: []
    };
  }

  if (existing.fingerprint !== fingerprint) {
    return {
      ok: false,
      mode: null,
      fingerprint,
      stored_response: null,
      errors: [createIdempotencyError("IDEMPOTENCY_CONFLICT", "idempotency_key was reused with a different request payload", "idempotency_key")]
    };
  }

  return {
    ok: true,
    mode: "replay",
    fingerprint,
    stored_response: clone(existing.response),
    errors: []
  };
}

export function saveIdempotencyResult(input, store) {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      record: null,
      errors: [createIdempotencyError("INVALID_IDEMPOTENCY_INPUT", "Input must be a non-null object", "input")]
    };
  }

  if (!hasStoreMethods(store)) {
    return {
      ok: false,
      record: null,
      errors: [createIdempotencyError("INVALID_IDEMPOTENCY_STORE", "Store must provide getRecord and saveRecord", "store")]
    };
  }

  if (!input.idempotency_key) {
    return {
      ok: false,
      record: null,
      errors: [createIdempotencyError("MISSING_IDEMPOTENCY_KEY", "idempotency_key is required", "idempotency_key")]
    };
  }

  if (!input.fingerprint) {
    return {
      ok: false,
      record: null,
      errors: [createIdempotencyError("MISSING_FINGERPRINT", "fingerprint is required", "fingerprint")]
    };
  }

  if (input.response === undefined || input.response === null) {
    return {
      ok: false,
      record: null,
      errors: [createIdempotencyError("MISSING_RESPONSE", "response is required", "response")]
    };
  }

  const saved = store.saveRecord({
    key: input.idempotency_key,
    fingerprint: input.fingerprint,
    status: "completed",
    response: clone(input.response)
  });

  return {
    ok: true,
    record: clone(saved),
    errors: []
  };
}
