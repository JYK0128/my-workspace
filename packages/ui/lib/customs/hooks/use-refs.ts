import { useCallback, useRef } from 'react';

export function useRefs<T extends HTMLElement>() {
  const refs = useRef<Set<T | null>>(new Set());

  const setRef = useCallback((el: T) => {
    if (!refs.current.has(el)) {
      refs.current.add(el);
    }
  }, []);

  return {
    refs,
    setRef,
  };
}
