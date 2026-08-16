/**
 * Fails loudly (rather than returning a boolean) so it reads like an assertion at the call site.
 * Mirrors the "loop through the array, assert key properties aren't empty/null/undefined"
 * requirement from the Postman collection (see postman/collection.json) so both suites express
 * the same contract check the same way.
 */
export function assertHasNonEmptyFields<T extends object>(value: T, keys: ReadonlyArray<keyof T>): void {
  for (const key of keys) {
    const fieldValue = value[key];
    const isEmpty = fieldValue === null || fieldValue === undefined || fieldValue === '';
    if (isEmpty) {
      throw new Error(`Expected "${String(key)}" to be present and non-empty, got ${String(fieldValue)}`);
    }
  }
}
