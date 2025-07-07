import { StepModalContext } from '#customs/contexts/index.ts';
import { useContext } from 'react';

export const useStepModal = <CACHE, DATA>() => {
  const context = useContext(StepModalContext) as StepModalContext<CACHE, DATA>;
  if (!context) {
    throw new Error('step modal must be used within an StepModalProvider.');
  }
  return context;
};
