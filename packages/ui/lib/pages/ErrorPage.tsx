import { SidebarLayout } from '#customs/components/SidebarLayout.tsx';
import { Button } from '#shadcn/components/ui/button.tsx';
import { useState } from 'react';

export function ErrorPage() {
  const [show, setShow] = useState(false);
  const makeRenderingError = () => {
    throw Error('rendering error');
  };

  const handleRenderingError = () => {
    setShow(true);
  };
  const handleRuntimeError = () => {
    throw new Error('runtime error');
  };
  const handlePromiseError = () => {
    Promise.reject(new Error('promise error'));
  };

  return (
    <SidebarLayout>
      {show && makeRenderingError()}
      <Button onClick={handleRenderingError}>렌더링 에러</Button>
      <Button onClick={handleRuntimeError}>런타임(동기) 에러</Button>
      <Button onClick={handlePromiseError}>런타임(비동기) 에러</Button>
    </SidebarLayout>
  );
}
