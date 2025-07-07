/**
 * JSON 안전하게 파싱하기
 */
export function safeParse<T = unknown>(data: unknown): T | null | undefined {
  try {
    return JSON.parse(data as string) as T;
  }
  catch {
    return data === 'undefined' ? undefined : null;
  }
}

/**
 * pick / rest로 나누기
 */
export function deconstruct<T extends object, U extends keyof T>(
  obj: T,
  args: Array<U>,
): [Pick<T, U>, Omit<T, U>] {
  const pickResult: Partial<T> = {};
  const omitResult: Partial<T> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (args.includes(key as unknown as U)) {
        pickResult[key] = obj[key];
      }
      else {
        omitResult[key] = obj[key];
      }
    }
  }

  return [pickResult as Pick<T, U>, omitResult as Omit<T, U>];
}

/**
 * property 확인
 */
export const has = <T>(params: unknown): params is T => {
  return params !== null && params !== undefined;
};
