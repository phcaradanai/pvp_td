export function createSessionStoreError(code, message, path = "", details = []) {
  return { code, message, path, details };
}
