export function createMatchStoreError(code, message, path, details = []) {
  return { code, message, path, details };
}
