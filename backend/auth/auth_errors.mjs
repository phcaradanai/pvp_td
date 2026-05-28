// auth_errors.mjs

export function createAuthError(code, message, path = "", details = []) {
  return { code, message, path, details };
}
