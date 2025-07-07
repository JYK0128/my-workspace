import { safeParse } from '@packages/utils';
import { Dispatch, SetStateAction, useRef, useSyncExternalStore } from 'react';

export function useSessionStorage<T>(key: string): [Nullish<T>, Dispatch<SetStateAction<T>>] {
  const previousValueRef = useRef<Nullish<string>>(null);

  const subscribe = (callback: () => void) => {
    const handler = () => {
      callback();
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  };

  const getSnapshot = () => {
    const newValue = sessionStorage.getItem(key);

    if (newValue === JSON.stringify(previousValueRef.current)) {
      return safeParse<T>(previousValueRef.current);
    }
    else {
      previousValueRef.current = newValue;
      return safeParse<T>(newValue);
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot);

  const setValue: Dispatch<SetStateAction<T>> = (valueOrUpdater) => {
    const oldValue = sessionStorage.getItem(key);

    const nextValue = typeof valueOrUpdater === 'function'
      ? (valueOrUpdater as (prev: Nullish<T>) => T)(safeParse<T>(oldValue))
      : valueOrUpdater;

    if (!nextValue) {
      sessionStorage.removeItem(key);
    }
    else {
      sessionStorage.setItem(key, JSON.stringify(nextValue));
    }
    window.dispatchEvent(new Event('storage'));
  };

  return [value, setValue];
}
