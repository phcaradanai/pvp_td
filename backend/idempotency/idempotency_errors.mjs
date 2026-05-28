export function createIdempotencyError(code, message, path = "", details = []) {
  return { code, message, path, details };
}
