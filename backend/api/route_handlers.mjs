import { ERROR_CODES, createApiError } from "./api_errors.mjs";
import { validateMatchResultSubmission } from "../contracts/match_result_contract.mjs";
import { buildRewardClaimPreview } from "../contracts/reward_claim_contract.mjs";
import { saveValidatedMatchResult, saveRewardClaimPreview } from "../persistence/persistence_service.mjs";
import { checkIdempotency, saveIdempotencyResult } from "../idempotency/idempotency_contract.mjs";
import { validateSessionFromStore } from "../session/session_store_contract.mjs";
import { validateMatchParticipationFromStore } from "../match_store/match_store_contract.mjs";

export function handleHealthCheck() {
  return {
    status: 200,
    body: {
      ok: true,
      service: "pvp-td-backend-api",
      mode: "skeleton"
    }
  };
}

export function handleValidateMatchResult(request, catalog) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const result = validateMatchResultSubmission(request.body);
  if (!result.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: result.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: result.accepted_result
    }
  };
}

export function handleRewardClaimPreview(request, catalog) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const result = buildRewardClaimPreview(request.body, catalog);
  if (!result.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: result.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: result.claim_preview
    }
  };
}

import { validateRequestSession, validateMatchParticipation } from "../auth/auth_session_contract.mjs";

function missingSessionStoreResponse() {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MISSING_SESSION_STORE, "sessionStore is required", "sessionStore")]
    }
  };
}

function sessionStoreValidationFailureResponse(sessionResult) {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.SESSION_STORE_VALIDATION_FAILED, "Session store validation failed", "session", sessionResult.errors)]
    }
  };
}

function matchParticipationFailureResponse(matchResult) {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MATCH_PARTICIPATION_FAILED, "Match participation failed", "server_context.match_context", matchResult.errors)]
    }
  };
}

function storeSessionContext(request, sessionStore) {
  if (!sessionStore) return missingSessionStoreResponse();

  const sessionResult = validateSessionFromStore({
    request_id: request.body.request_id,
    session: request.body.session
  }, sessionStore);

  if (!sessionResult.ok) return sessionStoreValidationFailureResponse(sessionResult);
  return { status: 200, body: { ok: true, session_context: sessionResult.session_context } };
}

function storeMatchParticipation(request, session_context) {
  const matchResult = validateMatchParticipation({
    request_id: request.body.request_id,
    session_context,
    match_context: request.body.server_context?.match_context
  });

  if (!matchResult.ok) return matchParticipationFailureResponse(matchResult);
  return { status: 200, body: { ok: true, participation_context: matchResult.participation_context } };
}

export function handleProtectedValidateMatchResult(request, catalog) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const { request_id, session, match_id, client_result_preview, server_context } = request.body;

  if (!server_context) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_SERVER_CONTEXT, "server_context is required")]
      }
    };
  }

  const sessionInput = {
    request_id,
    session,
    server_context
  };

  const sessionResult = validateRequestSession(sessionInput);
  if (!sessionResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.AUTH_SESSION_FAILED, "Session validation failed", "session", sessionResult.errors)]
      }
    };
  }

  if (!server_context.result_context) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_RESULT_CONTEXT, "result_context is required", "server_context.result_context")]
      }
    };
  }

  const matchInput = {
    request_id,
    session_context: sessionResult.session_context,
    match_context: server_context.match_context
  };

  const matchResult = validateMatchParticipation(matchInput);
  if (!matchResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MATCH_PARTICIPATION_FAILED, "Match participation failed", "server_context.match_context", matchResult.errors)]
      }
    };
  }

  const contractInput = {
    request_id,
    match_id,
    submitted_by: sessionResult.session_context.player_id,
    client_result_preview,
    server_context: server_context.result_context
  };

  const validateResult = validateMatchResultSubmission(contractInput);
  if (!validateResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: validateResult.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: validateResult.accepted_result
    }
  };
}

export function handleProtectedRewardClaimPreview(request, catalog) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const { request_id, session, match_result, players, server_context } = request.body;

  if (!server_context) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_SERVER_CONTEXT, "server_context is required")]
      }
    };
  }

  const sessionInput = {
    request_id,
    session,
    server_context
  };

  const sessionRes = validateRequestSession(sessionInput);
  if (!sessionRes.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.AUTH_SESSION_FAILED, "Session validation failed", "session", sessionRes.errors)]
      }
    };
  }

  if (!server_context.match_context) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_MATCH_CONTEXT, "match_context is required", "server_context.match_context")]
      }
    };
  }

  const matchInput = {
    request_id,
    session_context: sessionRes.session_context,
    match_context: server_context.match_context
  };

  const matchRes = validateMatchParticipation(matchInput);
  if (!matchRes.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MATCH_PARTICIPATION_FAILED, "Match participation failed", "server_context.match_context", matchRes.errors)]
      }
    };
  }

  const contractInput = {
    request_id,
    match_result,
    players
  };

  const rewardRes = buildRewardClaimPreview(contractInput, catalog);
  if (!rewardRes.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: rewardRes.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: rewardRes.claim_preview
    }
  };
}

export function handleStoreProtectedValidateMatchResult(request, catalog, sessionStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const sessionResult = storeSessionContext(request, sessionStore);
  if (!sessionResult.body.ok) return sessionResult;

  if (!request.body.server_context?.result_context) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_RESULT_CONTEXT, "result_context is required", "server_context.result_context")]
      }
    };
  }

  const participationResult = storeMatchParticipation(request, sessionResult.body.session_context);
  if (!participationResult.body.ok) return participationResult;

  const contractInput = {
    request_id: request.body.request_id,
    match_id: request.body.match_id,
    submitted_by: sessionResult.body.session_context.player_id,
    client_result_preview: request.body.client_result_preview,
    server_context: request.body.server_context.result_context
  };

  const validateResult = validateMatchResultSubmission(contractInput);
  if (!validateResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: validateResult.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: validateResult.accepted_result
    }
  };
}

export function handleStoreProtectedRewardClaimPreview(request, catalog, sessionStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  const sessionResult = storeSessionContext(request, sessionStore);
  if (!sessionResult.body.ok) return sessionResult;

  const participationResult = storeMatchParticipation(request, sessionResult.body.session_context);
  if (!participationResult.body.ok) return participationResult;

  const rewardResult = buildRewardClaimPreview({
    request_id: request.body.request_id,
    match_result: request.body.match_result,
    players: request.body.players
  }, catalog);

  if (!rewardResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: rewardResult.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: rewardResult.claim_preview
    }
  };
}

function missingRepositoriesResponse() {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MISSING_REPOSITORIES, "repositories are required", "repositories")]
    }
  };
}

function persistenceStatus(errors) {
  const retryableCodes = new Set(["SAVE_MATCH_RESULT_FAILED", "SAVE_REWARD_CLAIM_FAILED"]);
  return errors.some(error => retryableCodes.has(error.code)) ? 500 : 400;
}

function clone(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function missingIdempotencyStoreResponse() {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MISSING_IDEMPOTENCY_STORE, "idempotencyStore is required", "idempotencyStore")]
    }
  };
}

function idempotencyCheckFailureResponse(checkResult) {
  const hasConflict = checkResult.errors.some(error => error.code === "IDEMPOTENCY_CONFLICT");
  return {
    status: hasConflict ? 409 : 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.IDEMPOTENCY_CHECK_FAILED, "Idempotency check failed", "idempotency_key", checkResult.errors)]
    }
  };
}

function idempotencySaveFailureResponse(saveResult) {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.IDEMPOTENCY_SAVE_FAILED, "Saving idempotency result failed", "idempotency_key", saveResult.errors)]
    }
  };
}

function withIdempotencyMode(body, mode) {
  return {
    ...clone(body),
    idempotency: {
      mode
    }
  };
}

function checkRouteIdempotency(request, idempotencyStore) {
  return checkIdempotency({
    idempotency_key: request.body.idempotency_key,
    request_payload: request.body
  }, idempotencyStore);
}

export function handleProtectedValidateAndPersistMatchResult(request, catalog, repositories) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleProtectedValidateMatchResult(request, catalog);
  if (!protectedResult.body.ok) return protectedResult;

  const persistResult = saveValidatedMatchResult(
    { accepted_result: protectedResult.body.accepted_result },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_MATCH_RESULT_FAILED, "Persisting match result failed", "accepted_result", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: protectedResult.body.accepted_result,
      persisted_result: persistResult.saved_result
    }
  };
}

export function handleProtectedRewardClaimPreviewAndPersist(request, catalog, repositories) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleProtectedRewardClaimPreview(request, catalog);
  if (!protectedResult.body.ok) return protectedResult;

  const claimId = request.body.claim_id || `claim_${request.body.request_id}`;
  const persistResult = saveRewardClaimPreview(
    {
      claim_id: claimId,
      match_id: protectedResult.body.claim_preview.match_id,
      claim_preview: protectedResult.body.claim_preview
    },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_REWARD_CLAIM_FAILED, "Persisting reward claim preview failed", "claim_preview", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: protectedResult.body.claim_preview,
      persisted_claim: persistResult.saved_claim
    }
  };
}

export function handleIdempotentProtectedValidateAndPersistMatchResult(request, catalog, repositories, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleProtectedValidateAndPersistMatchResult(request, catalog, repositories);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}

export function handleIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleProtectedRewardClaimPreviewAndPersist(request, catalog, repositories);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}

export function handleStoreProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleStoreProtectedValidateMatchResult(request, catalog, sessionStore);
  if (!protectedResult.body.ok) return protectedResult;

  const persistResult = saveValidatedMatchResult(
    { accepted_result: protectedResult.body.accepted_result },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_MATCH_RESULT_FAILED, "Persisting match result failed", "accepted_result", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: protectedResult.body.accepted_result,
      persisted_result: persistResult.saved_result
    }
  };
}

export function handleStoreProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleStoreProtectedRewardClaimPreview(request, catalog, sessionStore);
  if (!protectedResult.body.ok) return protectedResult;

  const claimId = request.body.claim_id || `claim_${request.body.request_id}`;
  const persistResult = saveRewardClaimPreview(
    {
      claim_id: claimId,
      match_id: protectedResult.body.claim_preview.match_id,
      claim_preview: protectedResult.body.claim_preview
    },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_REWARD_CLAIM_FAILED, "Persisting reward claim preview failed", "claim_preview", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: protectedResult.body.claim_preview,
      persisted_claim: persistResult.saved_claim
    }
  };
}

export function handleStoreIdempotentProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleStoreProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}

export function handleStoreIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleStoreProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}

function hasMatchStoreMethods(matchStore) {
  return matchStore
    && typeof matchStore.getMatch === "function"
    && typeof matchStore.saveMatch === "function"
    && typeof matchStore.updateMatchStatus === "function"
    && typeof matchStore.saveMatchResult === "function"
    && typeof matchStore.listMatchesByPlayer === "function";
}

function missingMatchStoreResponse() {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MISSING_MATCH_STORE, "matchStore is required", "matchStore")]
    }
  };
}

function matchStoreValidationFailureResponse(matchResult) {
  return {
    status: 400,
    body: {
      ok: false,
      errors: [createApiError(ERROR_CODES.MATCH_STORE_VALIDATION_FAILED, "Match store validation failed", "match_id", matchResult.errors)]
    }
  };
}

function storeMatchParticipationContext(request, session_context, matchStore) {
  const matchResult = validateMatchParticipationFromStore({
    request_id: request.body.request_id,
    session_context,
    match_id: request.body.match_id
  }, matchStore);

  if (!matchResult.ok) return matchStoreValidationFailureResponse(matchResult);
  return { status: 200, body: { ok: true, participation_context: matchResult.participation_context } };
}

export function handleStoreMatchProtectedValidateMatchResult(request, catalog, sessionStore, matchStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!hasMatchStoreMethods(matchStore)) return missingMatchStoreResponse();

  const sessionResult = storeSessionContext(request, sessionStore);
  if (!sessionResult.body.ok) return sessionResult;

  const participationResult = storeMatchParticipationContext(request, sessionResult.body.session_context, matchStore);
  if (!participationResult.body.ok) return participationResult;

  const participation_context = participationResult.body.participation_context;
  const matchForContext = matchStore.getMatch(request.body.match_id);

  const contractInput = {
    request_id: request.body.request_id,
    match_id: request.body.match_id,
    submitted_by: sessionResult.body.session_context.player_id,
    client_result_preview: request.body.client_result_preview,
    server_context: {
      allowed_player_ids: clone(matchForContext.allowed_player_ids),
      match_status: participation_context.match_status,
      match_phase: participation_context.match_phase
    }
  };

  const validateResult = validateMatchResultSubmission(contractInput);
  if (!validateResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: validateResult.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: validateResult.accepted_result
    }
  };
}

export function handleStoreMatchProtectedRewardClaimPreview(request, catalog, sessionStore, matchStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!hasMatchStoreMethods(matchStore)) return missingMatchStoreResponse();

  const sessionResult = storeSessionContext(request, sessionStore);
  if (!sessionResult.body.ok) return sessionResult;

  const participationResult = storeMatchParticipationContext(request, sessionResult.body.session_context, matchStore);
  if (!participationResult.body.ok) return participationResult;

  const rewardResult = buildRewardClaimPreview({
    request_id: request.body.request_id,
    match_result: request.body.match_result,
    players: request.body.players
  }, catalog);

  if (!rewardResult.ok) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: rewardResult.errors
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: rewardResult.claim_preview
    }
  };
}

export function handleStoreMatchProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore, matchStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleStoreMatchProtectedValidateMatchResult(request, catalog, sessionStore, matchStore);
  if (!protectedResult.body.ok) return protectedResult;

  const persistResult = saveValidatedMatchResult(
    { accepted_result: protectedResult.body.accepted_result },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_MATCH_RESULT_FAILED, "Persisting match result failed", "accepted_result", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      accepted_result: protectedResult.body.accepted_result,
      persisted_result: persistResult.saved_result
    }
  };
}

export function handleStoreMatchProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore, matchStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!repositories) return missingRepositoriesResponse();

  const protectedResult = handleStoreMatchProtectedRewardClaimPreview(request, catalog, sessionStore, matchStore);
  if (!protectedResult.body.ok) return protectedResult;

  const claimId = request.body.claim_id || `claim_${request.body.request_id}`;
  const persistResult = saveRewardClaimPreview(
    {
      claim_id: claimId,
      match_id: protectedResult.body.claim_preview.match_id,
      claim_preview: protectedResult.body.claim_preview
    },
    repositories
  );

  if (!persistResult.ok) {
    return {
      status: persistenceStatus(persistResult.errors),
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.PERSIST_REWARD_CLAIM_FAILED, "Persisting reward claim preview failed", "claim_preview", persistResult.errors)]
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      claim_preview: protectedResult.body.claim_preview,
      persisted_claim: persistResult.saved_claim
    }
  };
}

export function handleStoreMatchIdempotentProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore, matchStore, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleStoreMatchProtectedValidateAndPersistMatchResult(request, catalog, repositories, sessionStore, matchStore);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}

export function handleStoreMatchIdempotentProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore, matchStore, idempotencyStore) {
  if (!request || !request.body) {
    return {
      status: 400,
      body: {
        ok: false,
        errors: [createApiError(ERROR_CODES.MISSING_REQUEST_BODY, "Request body is required")]
      }
    };
  }

  if (!idempotencyStore) return missingIdempotencyStoreResponse();
  if (!repositories) return missingRepositoriesResponse();

  const idempotencyResult = checkRouteIdempotency(request, idempotencyStore);
  if (!idempotencyResult.ok) return idempotencyCheckFailureResponse(idempotencyResult);

  if (idempotencyResult.mode === "replay") {
    return {
      status: 200,
      body: withIdempotencyMode(idempotencyResult.stored_response, "replay")
    };
  }

  const downstream = handleStoreMatchProtectedRewardClaimPreviewAndPersist(request, catalog, repositories, sessionStore, matchStore);
  if (downstream.status !== 200 || !downstream.body.ok) return downstream;

  const responseBody = withIdempotencyMode(downstream.body, "new");
  const saveResult = saveIdempotencyResult({
    idempotency_key: request.body.idempotency_key,
    fingerprint: idempotencyResult.fingerprint,
    response: responseBody
  }, idempotencyStore);

  if (!saveResult.ok) return idempotencySaveFailureResponse(saveResult);

  return {
    status: 200,
    body: responseBody
  };
}
