import { ERROR_CODES, createApiError } from "./api_errors.mjs";
import { validateMatchResultSubmission } from "../contracts/match_result_contract.mjs";
import { buildRewardClaimPreview } from "../contracts/reward_claim_contract.mjs";

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
