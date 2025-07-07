import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cv<
  Key extends string | number,
  Args extends unknown[],
>(resolver: (key: Key, ...args: Args) => string): Record<Key, (...args: Args) => string> {
  return new Proxy({} as Record<Key, (...args: Args) => string>, {
    get: (_, prop) => (...args: Args) => resolver(prop as Key, ...args),
  });
}
