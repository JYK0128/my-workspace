import { MessageContext, useMessage } from '#customs/hooks/index.ts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '#shadcn/components/ui/index.ts';
import { useState } from 'react';

export function Message() {
  const [options] = useState<MessageContext>({});
  const { messages } = useMessage();

  return (
    <MessageContext.Provider value={options}>
      {messages.map(({ id, type, title, description, open, toggle, cancel, confirm }) => (
        <AlertDialog key={id} open={open} onOpenChange={toggle}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {
                type === 'confirm'
                && (
                  <AlertDialogCancel
                    onClick={cancel}
                  >
                    취소
                  </AlertDialogCancel>
                )
              }
              <AlertDialogAction
                ref={(el) => { requestAnimationFrame(() => el?.focus()); }}
                onClick={confirm}
              >
                확인
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </MessageContext.Provider>
  );
}
