import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import {
  buildRequestFingerprint,
  checkIdempotency,
  saveIdempotencyResult
} from "../idempotency_contract.mjs";
import { createInMemoryIdempotencyStore } from "../in_memory_idempotency_store.mjs";

const projectRoot = process.cwd();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("Idempotency contract tests", async (t) => {
  const validRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "idempotency.valid.sample.json"), "utf8");
  const invalidRaw = await fs.readFile(path.join(projectRoot, "data", "samples", "idempotency.invalid.sample.json"), "utf8");
  const valid = JSON.parse(validRaw);
  const invalid = JSON.parse(invalidRaw);

  await t.test("buildRequestFingerprint is stable for same semantic object", () => {
    const a = valid.stable_fingerprint_payload;
    const b = {
      accepted_result: {
        score: {
          player_b: { core_hp: 100 },
          player_a: { core_hp: 100 }
        },
        reason: "EQUAL_CORE_HP_PLACEHOLDER_DRAW",
        is_draw: true,
        winner: null
      },
      match_id: "local_match_001"
    };

    assert.equal(buildRequestFingerprint(a), buildRequestFingerprint(b));
  });

  await t.test("buildRequestFingerprint changes when payload changes", () => {
    const a = valid.new_match_result_request.request_payload;
    const b = invalid.conflicting_request_payload.request_payload;

    assert.notEqual(buildRequestFingerprint(a), buildRequestFingerprint(b));
  });

  await t.test("new idempotency request returns mode new", () => {
    const store = createInMemoryIdempotencyStore();
    const res = checkIdempotency(valid.new_match_result_request, store);

    assert.equal(res.ok, true);
    assert.equal(res.mode, "new");
    assert.equal(res.stored_response, null);
    assert.ok(res.fingerprint);
  });

  await t.test("replay with same key and same fingerprint returns stored response", () => {
    const store = createInMemoryIdempotencyStore();
    const first = checkIdempotency(valid.new_match_result_request, store);
    const response = { ok: true, persisted_result: { match_id: "local_match_001" } };
    saveIdempotencyResult({
      idempotency_key: valid.new_match_result_request.idempotency_key,
      fingerprint: first.fingerprint,
      response
    }, store);

    const replay = checkIdempotency(valid.replay_match_result_request, store);
    assert.equal(replay.ok, true);
    assert.equal(replay.mode, "replay");
    assert.deepEqual(replay.stored_response, response);
  });

  await t.test("same key with different payload fails with IDEMPOTENCY_CONFLICT", () => {
    const store = createInMemoryIdempotencyStore();
    const first = checkIdempotency(valid.new_match_result_request, store);
    saveIdempotencyResult({
      idempotency_key: valid.new_match_result_request.idempotency_key,
      fingerprint: first.fingerprint,
      response: { ok: true }
    }, store);

    const conflict = checkIdempotency(invalid.conflicting_request_payload, store);
    assert.equal(conflict.ok, false);
    assert.ok(conflict.errors.some(e => e.code === "IDEMPOTENCY_CONFLICT"));
  });

  await t.test("saveIdempotencyResult stores completed response", () => {
    const store = createInMemoryIdempotencyStore();
    const check = checkIdempotency(valid.new_reward_claim_request, store);
    const response = { ok: true, persisted_claim: { claim_id: "claim_req_persist_reward_001" } };
    const saved = saveIdempotencyResult({
      idempotency_key: valid.new_reward_claim_request.idempotency_key,
      fingerprint: check.fingerprint,
      response
    }, store);
    const record = store.getRecord(valid.new_reward_claim_request.idempotency_key);

    assert.equal(saved.ok, true);
    assert.equal(saved.record.status, "completed");
    assert.deepEqual(record.response, response);
  });

  await t.test("store clone prevents mutation leak", () => {
    const store = createInMemoryIdempotencyStore();
    const fingerprint = buildRequestFingerprint(valid.new_reward_claim_request.request_payload);
    const response = { ok: true, persisted_claim: { rewards: { player_a: { xp_delta: 10 } } } };
    saveIdempotencyResult({
      idempotency_key: "req_clone_test",
      fingerprint,
      response
    }, store);

    const loaded = store.getRecord("req_clone_test");
    loaded.response.persisted_claim.rewards.player_a.xp_delta = 999;
    const loadedAgain = store.getRecord("req_clone_test");

    assert.equal(loadedAgain.response.persisted_claim.rewards.player_a.xp_delta, 10);
  });

  await t.test("checkIdempotency does not mutate input", () => {
    const store = createInMemoryIdempotencyStore();
    const input = clone(valid.new_match_result_request);
    const snapshot = JSON.stringify(input);
    checkIdempotency(input, store);
    assert.equal(JSON.stringify(input), snapshot);
  });

  await t.test("saveIdempotencyResult does not mutate input", () => {
    const store = createInMemoryIdempotencyStore();
    const input = {
      idempotency_key: "req_no_mutate_save",
      fingerprint: "stable_fingerprint",
      response: { ok: true, nested: { value: 1 } }
    };
    const snapshot = JSON.stringify(input);
    saveIdempotencyResult(input, store);
    assert.equal(JSON.stringify(input), snapshot);
  });

  await t.test("missing idempotency_key fails", () => {
    const store = createInMemoryIdempotencyStore();
    const res = checkIdempotency(invalid.missing_idempotency_key, store);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_IDEMPOTENCY_KEY"));
  });

  await t.test("missing request_payload fails", () => {
    const store = createInMemoryIdempotencyStore();
    const res = checkIdempotency(invalid.missing_request_payload, store);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_REQUEST_PAYLOAD"));
  });

  await t.test("missing fingerprint fails", () => {
    const store = createInMemoryIdempotencyStore();
    const res = saveIdempotencyResult(invalid.missing_fingerprint, store);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_FINGERPRINT"));
  });

  await t.test("missing response fails", () => {
    const store = createInMemoryIdempotencyStore();
    const res = saveIdempotencyResult(invalid.missing_response, store);
    assert.equal(res.ok, false);
    assert.ok(res.errors.some(e => e.code === "MISSING_RESPONSE"));
  });

  await t.test("invalid store fails", () => {
    const check = checkIdempotency(valid.new_match_result_request, invalid.invalid_store);
    const save = saveIdempotencyResult({
      idempotency_key: "req_invalid_store",
      fingerprint: "stable_fingerprint",
      response: { ok: true }
    }, invalid.invalid_store);

    assert.equal(check.ok, false);
    assert.ok(check.errors.some(e => e.code === "INVALID_IDEMPOTENCY_STORE"));
    assert.equal(save.ok, false);
    assert.ok(save.errors.some(e => e.code === "INVALID_IDEMPOTENCY_STORE"));
  });
});
