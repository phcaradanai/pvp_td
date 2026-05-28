export function createPersistenceError(code, message, path = "", details = []) {
  return { code, message, path, details };
}
