import { Ref, useCallback, useRef } from 'react';

/**
 * callback Ref hook
 * @description ref 변경을 탐지
 * @param ref Forward ref
 */
export function useCallbackRef<T>(ref?: Ref<T>) {
  const localRef = useRef<T | null>(null);

  const setRef = useCallback((node: T | null) => {
    if (typeof ref === 'function') {
      ref(node);
    }
    else if (ref) {
      ref.current = node;
    }
    localRef.current = node;
  }, [ref]);

  return [localRef, setRef] as const;
}
