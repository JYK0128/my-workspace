/**
 * PromiseLike 처리하기
 */
export async function resolve<T>(
  runnable: T | Promise<T>,
  callback?: (result: T) => void,
  fallback?: (error: unknown) => void,
): Promise<T | undefined> {
  try {
    const value = typeof runnable === 'function'
      ? runnable()
      : runnable;

    const result = await Promise.resolve(value);
    callback?.(result);
    return result;
  }
  catch (error) {
    fallback?.(error);
    throw error;
  }
}

/**
 * 조건부 함수 수행하기
 */
export const execute = <T, R>(
  target: T | null | undefined | (() => T),
  callback: (value: T) => R,
): R | undefined => {
  const value = typeof target === 'function'
    ? (target as () => T)()
    : target;

  if (value) return callback(value);
};
