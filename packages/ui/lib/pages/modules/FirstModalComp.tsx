import { useStepModal } from '#customs/hooks/index.ts';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#shadcn/components/ui/index.ts';
import { PropsWithChildren } from 'react';

export function FirstModalComp(props: PropsWithChildren) {
  const modal = useStepModal<null, { modal01: string }>();

  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>첫번째 모달</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      첫번째 모달입니다.
      <DialogFooter>
        <Button onClick={modal.cancel}>닫기</Button>
        <Button onClick={() => modal.next({ data: { modal01: '모달01 데이터' } })}>다음</Button>
      </DialogFooter>
    </DialogContent>
  );
}
