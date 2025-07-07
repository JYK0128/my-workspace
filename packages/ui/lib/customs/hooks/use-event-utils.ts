import { BaseSyntheticEvent, Dispatch, Dispatcher, Setter, useEffect, useState } from 'react';

// 상태
type State = {
  timeout: number
  isLock: boolean
  timer?: NodeJS.Timeout
};

const memoryState: State = {
  isLock: false,
  timeout: 3000,
};

// 액션
type Action =
  | { type: 'LOCK' }
  | { type: 'UNLOCK' }
  | { type: 'SET_TIMER', timer: NodeJS.Timeout }
  | { type: 'CLEAR_TIMER' };

function reducer(action: Action): Setter<State> {
  switch (action.type) {
    case 'LOCK':
      return (prev) => ({ ...prev, isLock: true });
    case 'UNLOCK':
      return (prev) => ({ ...prev, isLock: false });
    case 'SET_TIMER':
      return (prev) => ({ ...prev, timer: action.timer });
    case 'CLEAR_TIMER':
      return (prev) => (
        clearTimeout(prev.timer),
        { ...prev, timer: undefined }
      );
    default:
      throw Error('unexpected error');
  }
}

// 방출
const listeners: Array<Dispatcher<State>> = [];

function dispatch(action: Action) {
  const updateFn = reducer(action);
  listeners.forEach((listener) => listener(updateFn));
}

/**
 * 이벤트 핸들러 유틸
 */
export function useEventUtils() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const prevent = <T extends BaseSyntheticEvent>(callbackLike?: T | Dispatch<T>): Dispatch<T> | undefined => {
    if (callbackLike instanceof Function) {
      return (evt) => {
        evt?.preventDefault();
        callbackLike?.(evt);
      };
    }
    else {
      callbackLike?.preventDefault();
    }
  };

  const stop = <T extends BaseSyntheticEvent>(callbackLike?: T | Dispatch<T>): Dispatch<T> | undefined => {
    if (callbackLike instanceof Function) {
      return (evt) => {
        evt?.stopPropagation();
        callbackLike?.(evt);
      };
    }
    else {
      callbackLike?.stopPropagation();
    }
  };

  const first = <T extends unknown[]>(
    callback?: ExecutionHandlers<T>['callback'],
    fallback?: ExecutionHandlers<T>['fallback'],
    cleanup?: ExecutionHandlers<T>['cleanup'],
  ) => {
    return async (...params: T) => {
      if (state.isLock) return;

      if (state.timer) {
        dispatch({ type: 'CLEAR_TIMER' });
      }

      dispatch({ type: 'LOCK' });
      await Promise.resolve()
        .then(async () => {
          await Promise.resolve(callback?.(...params));
        })
        .catch(async (err) => {
          if (!fallback) throw err;
          await Promise.resolve(fallback?.(err));
        })
        .finally(async () => {
          await Promise.resolve(cleanup?.());
          dispatch({ type: 'UNLOCK' });
        });
    };
  };

  const last = <T extends unknown[]>(
    callback?: ExecutionHandlers<T>['callback'],
    fallback?: ExecutionHandlers<T>['fallback'],
    cleanup?: ExecutionHandlers<T>['cleanup'],
  ) => {
    return async (...params: T) => {
      if (state.isLock) return;

      if (state.timer) {
        dispatch({ type: 'CLEAR_TIMER' });
      }

      const timer = setTimeout(async () => {
        dispatch({ type: 'LOCK' });

        await Promise.resolve()
          .then(async () => {
            await Promise.resolve(callback?.(...params));
          })
          .catch(async (err) => {
            if (!fallback) throw err;
            await Promise.resolve(fallback?.(err));
          })
          .finally(async () => {
            await Promise.resolve(cleanup?.());
            dispatch({ type: 'UNLOCK' });
          });
      }, state.timeout);

      dispatch({ type: 'SET_TIMER', timer });
    };
  };

  const throttle = <T extends unknown[]>(
    callback?: ExecutionHandlers<T>['callback'],
    fallback?: ExecutionHandlers<T>['fallback'],
    cleanup?: ExecutionHandlers<T>['cleanup'],
  ) => {
    return async (...params: T) => {
      if (state.isLock) return;

      dispatch({ type: 'LOCK' });
      setTimeout(async () => {
        dispatch({ type: 'UNLOCK' });
      }, state.timeout);

      await Promise.resolve()
        .then(async () => {
          await Promise.resolve(callback?.(...params));
        })
        .catch(async (err) => {
          if (!fallback) throw err;
          await Promise.resolve(fallback?.(err));
        })
        .finally(async () => {
          await Promise.resolve(cleanup?.());
          dispatch({ type: 'UNLOCK' });
        });
    };
  };

  return { prevent, stop, first, last, throttle, isLock: state.isLock };
}
