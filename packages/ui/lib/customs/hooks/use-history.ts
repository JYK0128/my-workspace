import { useCallbackRef } from '#customs/hooks/use-callback-ref.ts';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';

export function useHistory<T, K extends HTMLElement = HTMLElement>(initialState: T, options = { skipFirst: false }) {
  const [ref, setRef] = useCallbackRef<K>();

  const [state, setState] = useState(initialState);
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const snapRef = useRef<Nullable<T>>(null);

  useEffect(() => console.log({ past }), [past]);
  useEffect(() => console.log({ future }), [future]);

  const canUndo = past.length > +options.skipFirst;
  const canRedo = future.length > 0;


  const commit = useCallback(() => {
    setPast((prev) => [...prev, snapRef.current as T]);
    setFuture([]);
    snapRef.current = null;
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lazyCommit = useCallback(debounce(commit, 300, { leading: false, trailing: true }), []);

  const setStateWrapper = useCallback((updater: SetStateAction<T>, options = { immediate: true }) => {
    setState((snap) => {
      const next = typeof updater === 'function'
        ? (updater as (snap: T) => T)(snap)
        : updater;

      if (!snapRef.current) {
        snapRef.current = snap;
      }

      if (options.immediate) {
        commit();
      }
      else {
        lazyCommit();
      }
      return next;
    });
  }, [commit, lazyCommit]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setPast((p) => {
      const previous = p[p.length - 1];
      setFuture((f) => [state, ...f]);
      setState(previous);
      return p.slice(0, -1);
    });
  }, [canUndo, state]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setFuture((f) => {
      const next = f[0];
      setPast((p) => [...p, state]);
      setState(next);
      return f.slice(1);
    });
  }, [canRedo, state]);

  useEffect(() => {
    const target = ref.current ?? window;
    const handleKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (canUndo) undo();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [ref, canRedo, canUndo, redo, undo]);


  return [
    state,
    setStateWrapper,
    {
      ref,
      setRef,
      undo,
      redo,
      canUndo,
      canRedo,
      history: { past, future },
    },
  ] as const;
}
