export const ERROR_CODES = {
  MISSING_REQUEST_BODY: "MISSING_REQUEST_BODY",
  API_HANDLER_ERROR: "API_HANDLER_ERROR"
};

export function createApiError(code, message, path = "", details = []) {
  return { code, message, path, details };
}
