import { useStepModal } from '#customs/hooks/index.ts';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#shadcn/components/ui/index.ts';
import { PropsWithChildren } from 'react';

export function NextModalComp(props: PropsWithChildren) {
  const modal = useStepModal();

  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>두번째 모달</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      두번째 모달입니다.
      <DialogFooter>
        <Button onClick={modal.confirm}>닫기</Button>
        <Button onClick={modal.prev}>이전</Button>
      </DialogFooter>
    </DialogContent>
  );
}
