import { createContext, useContext } from 'react';

type StepModalParams<CACHE, DATA> = {
  cache?: CACHE
  data?: DATA
};
export type StepModalContext<CACHE, DATA> = {
  page: number
  cache: Nullish<CACHE>
  result: Nullish<DATA>
  prev: () => void
  next: (params: StepModalParams<CACHE, DATA>) => void
  confirm: <T>(callback: PromiseLike<T> | T) => Promise<void>
  cancel: () => void
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StepModalContext = createContext<Nullable<StepModalContext<any, any>>>(null);

export const useStepModal = <CACHE, DATA>() => {
  const context = useContext(StepModalContext) as StepModalContext<CACHE, DATA>;
  if (!context) {
    throw new Error('step modal must be used within an StepModalProvider.');
  }
  return context;
};
