import { createPersistenceError } from "./persistence_errors.mjs";

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function hasMethod(target, method) {
  return target && typeof target[method] === "function";
}

function validateMatchRepositories(repositories) {
  if (!repositories || !hasMethod(repositories.matches, "getMatch") || !hasMethod(repositories.matches, "saveMatchResult")) {
    return createPersistenceError("INVALID_REPOSITORIES", "repositories.matches must provide getMatch and saveMatchResult", "repositories.matches");
  }
  return null;
}

function validateRewardClaimRepositories(repositories) {
  if (!repositories || !hasMethod(repositories.reward_claims, "saveRewardClaim")) {
    return createPersistenceError("INVALID_REPOSITORIES", "repositories.reward_claims must provide saveRewardClaim", "repositories.reward_claims");
  }
  return null;
}

export function saveValidatedMatchResult(input, repositories) {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      saved_result: null,
      errors: [createPersistenceError("INVALID_PERSISTENCE_INPUT", "Input must be a non-null object", "input")]
    };
  }

  const repositoryError = validateMatchRepositories(repositories);
  if (repositoryError) return { ok: false, saved_result: null, errors: [repositoryError] };

  if (!input.accepted_result) {
    return {
      ok: false,
      saved_result: null,
      errors: [createPersistenceError("MISSING_ACCEPTED_RESULT", "accepted_result is required", "accepted_result")]
    };
  }

  if (!input.accepted_result.match_id) {
    return {
      ok: false,
      saved_result: null,
      errors: [createPersistenceError("MISSING_MATCH_ID", "accepted_result.match_id is required", "accepted_result.match_id")]
    };
  }

  const acceptedResult = clone(input.accepted_result);
  const match = repositories.matches.getMatch(acceptedResult.match_id);
  if (!match) {
    return {
      ok: false,
      saved_result: null,
      errors: [createPersistenceError("MATCH_NOT_FOUND", "Match record was not found", "accepted_result.match_id")]
    };
  }

  const savedResult = repositories.matches.saveMatchResult(acceptedResult.match_id, acceptedResult);
  if (!savedResult) {
    return {
      ok: false,
      saved_result: null,
      errors: [createPersistenceError("SAVE_MATCH_RESULT_FAILED", "Match result could not be saved", "accepted_result")]
    };
  }

  return { ok: true, saved_result: clone(savedResult), errors: [] };
}

export function saveRewardClaimPreview(input, repositories) {
  if (!input || typeof input !== "object") {
    return {
      ok: false,
      saved_claim: null,
      errors: [createPersistenceError("INVALID_PERSISTENCE_INPUT", "Input must be a non-null object", "input")]
    };
  }

  const repositoryError = validateRewardClaimRepositories(repositories);
  if (repositoryError) return { ok: false, saved_claim: null, errors: [repositoryError] };

  if (!input.claim_id) {
    return {
      ok: false,
      saved_claim: null,
      errors: [createPersistenceError("MISSING_CLAIM_ID", "claim_id is required", "claim_id")]
    };
  }

  if (!input.match_id) {
    return {
      ok: false,
      saved_claim: null,
      errors: [createPersistenceError("MISSING_MATCH_ID", "match_id is required", "match_id")]
    };
  }

  if (!input.claim_preview) {
    return {
      ok: false,
      saved_claim: null,
      errors: [createPersistenceError("MISSING_CLAIM_PREVIEW", "claim_preview is required", "claim_preview")]
    };
  }

  const savedClaim = repositories.reward_claims.saveRewardClaim({
    claim_id: input.claim_id,
    match_id: input.match_id,
    claim_preview: clone(input.claim_preview)
  });

  if (!savedClaim) {
    return {
      ok: false,
      saved_claim: null,
      errors: [createPersistenceError("SAVE_REWARD_CLAIM_FAILED", "Reward claim preview could not be saved", "claim_preview")]
    };
  }

  return { ok: true, saved_claim: clone(savedClaim), errors: [] };
}
