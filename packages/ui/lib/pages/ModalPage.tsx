import { useState } from 'react';

import { SidebarLayout } from '#customs/components/SidebarLayout.tsx';
import { StepModal } from '#customs/components/StepModal.tsx';
import { useMessage } from '#customs/hooks/use-message.ts';
import { FirstModalComp } from '#pages/modules/FirstModalComp.tsx';
import { NextModalComp } from '#pages/modules/NextModalComp.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';

export function ModalPage() {
  const { message } = useMessage();
  const [result, setResult] = useState<boolean>();

  const handleAlert = () => {
    message({
      type: 'alert',
      title: '알림',
      description: '알림 메시지입니다.',
    }).then((res) => setResult(res));
  };

  const handleConfirm = () => {
    message({
      type: 'confirm',
      title: '확인',
      description: '확인 메시지입니다.',
    }).then((res) => setResult(res));
  };

  const handleError = () => {
    message({
      type: 'error',
      title: '에러',
      description: '에러 메시지입니다.',
    }).then((res) => setResult(res));
  };

  return (
    <SidebarLayout>
      <div>
        <Button onClick={handleAlert}>알림</Button>
        <Button onClick={handleConfirm}>확인</Button>
        <Button onClick={handleError}>에러</Button>
        <div>{JSON.stringify(result)}</div>
      </div>

      <div>
        <StepModal
          callback={() => console.log('후 처리 작업')}
          closable={[false, true]}
          render={[
            <FirstModalComp key="first" />,
            <NextModalComp key="second" />,
          ]}
        >
          <Button>모달</Button>
        </StepModal>
      </div>
    </SidebarLayout>
  );
}
