// backend_contract_errors.mjs

export function createContractError(code, message, path, details = []) {
  return { code, message, path, details };
}
