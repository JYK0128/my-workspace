import { SidebarLayout } from '#customs/components/SidebarLayout.tsx';
import { useEventUtils } from '#customs/hooks/use-event-utils.ts';
import { Button } from '#shadcn/components/ui/button.tsx';

export function EventPage() {
  const { first, last, throttle, isLock } = useEventUtils();


  const handleFirst = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('hi');
        resolve();
      }, 5000);
    });
  };

  const handleThrottle = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('boring');
        resolve();
      }, 5000);
    });
  };

  const handleLast = async () => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('bye');
        resolve();
      }, 5000);
    });
  };

  return (
    <SidebarLayout>
      {isLock ? '잠금' : '해제'}
      <Button onClick={first(
        handleFirst,
        () => console.log('fallback'),
        () => console.log('cleanup'),
      )}
      >
        처음
      </Button>
      <Button onClick={throttle(
        handleThrottle,
        () => console.log('fallback'),
        () => console.log('cleanup'),
      )}
      >
        중간
      </Button>
      <Button onClick={last(
        handleLast,
        () => console.log('fallback'),
        () => console.log('cleanup'),
      )}
      >
        마지막
      </Button>
    </SidebarLayout>
  );
}
