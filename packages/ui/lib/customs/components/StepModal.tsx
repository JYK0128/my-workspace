import { ComponentPropsWithoutRef, MouseEventHandler, PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';

import { StepModalContext, useMessage } from '#customs/hooks/index.ts';
import { Dialog, DialogTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

type Props = ComponentPropsWithoutRef<'button'> & {
  render: ReactNode[]
  closable?: boolean[] | boolean
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback?: Function
};

/** 모달창 */
// TODO: 깜빡임 이슈
export function StepModal<CACHE, DATA>({ children, render, closable, callback, ...props }: PropsWithChildren<Props>) {
  const [page, setPage] = useState(0);
  const [caches, setCaches] = useState<StepModalContext<CACHE, DATA>['cache'][]>([]);
  const [result, setResult] = useState<StepModalContext<CACHE, DATA>['result']>(null);
  const [open, setOpen] = useState(false);
  const { message } = useMessage();

  const content = useMemo(() => {
    return render.at(page);
  }, [page, render]);
  const cache = useMemo(() => {
    return caches.at(page);
  }, [caches, page]);

  // 이전 스텝 이동
  const handlePrevPage = useCallback<StepModalContext<CACHE, DATA>['prev']>(() => {
    setPage(page > 0 ? page - 1 : 0);
    setResult(null);
  }, [page]);

  // 다음 스텝 이동
  const handleNextPage = useCallback<StepModalContext<CACHE, DATA>['next']>(({ cache, data }) => {
    setCaches((prev) => prev.toSpliced(page, 1, cache));
    setResult(data);
    setPage(page < render.length - 1 ? page + 1 : page);
  }, [page, render.length]);

  // 모달 열기 / 닫기
  const handleModal = useCallback((open: boolean, promise?: Promise<unknown>) => {
    // 모달 열기
    if (open) {
      setCaches([]);
      setResult(null);
      setPage(0);
      setOpen(true);

      return Promise.resolve();
    }
    // 모달 닫기
    else {
      // 닫기 시 실행할 함수가 있을 경우(확인)
      if (promise) {
        return promise
          .then((res) => {
            callback?.(res);
            setOpen(false);
          });
      }
      // 닫기 시 실행할 함수가 없는 경우(취소)
      else {
        if (Array.isArray(closable) ? closable[page] : closable) {
          return Promise.resolve(setOpen(false));
        }
        else {
          return message({
            type: 'confirm',
            title: '작업을 중지하시겠습니까?',
            description: '',
          }).then((res) =>
            res
              ? setOpen(false)
              : Promise.resolve(),
          );
        }
      }
    }
  }, [callback, closable, page, message]);

  // 모달 - 폼 확인
  const handleConfirm = useCallback<StepModalContext<CACHE, DATA>['confirm']>((promise) => {
    return handleModal(false, Promise.resolve(promise));
  }, [handleModal]);

  // 모달 - 폼 취소
  const handleCancel = useCallback<StepModalContext<CACHE, DATA>['cancel']>(() => {
    return handleModal(false);
  }, [handleModal]);

  // 모달 - 폼 초기화
  const handleReset: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setCaches([]);
    setResult(null);
    setPage(0);
  };


  const value = useMemo<StepModalContext<CACHE, DATA>>(() => ({
    page,
    result,
    cache,
    prev: handlePrevPage,
    next: handleNextPage,
    confirm: handleConfirm,
    cancel: handleCancel,
  }), [page, result, cache, handlePrevPage, handleNextPage, handleConfirm, handleCancel]);

  return (
    <StepModalContext.Provider value={value}>
      <Dialog open={open} onOpenChange={handleModal}>
        <DialogTrigger
          {...props}
          className={cn(
            props.className,
            'tw:cursor-pointer',
          )}
          onClick={handleReset}
          asChild
        >
          {children}
        </DialogTrigger>
        {open && content}
      </Dialog>
    </StepModalContext.Provider>
  );
}
