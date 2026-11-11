/**
 * Throws an error if expression is null, undefined or empty string.
 * @param expression
 * @param msg Error message
 */
export function assert<
  T,
  U extends
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'object'
    | 'function',
>(
  expression: T,
  options?: {
    msg?: string;
    type?: U;
  }
): asserts expression is U extends 'undefined'
  ? U
  : Exclude<T, null | undefined | ''> {
  if (expression === null || expression === undefined || expression === '') {
    throw new Error(
      options?.msg ??
        `Expected "${expression}" to be defined and not an empty string`
    );
  }

  const type = typeof expression;
  if (options?.type && type !== options?.type) {
    throw new Error(
      options.msg ??
        `Expected "${expression}" to be of type ${options.type} but was ${type}`
    );
  }
}
