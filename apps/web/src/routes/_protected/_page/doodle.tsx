import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/_protected/_page/doodle')({
  component: withMenu(RouteComponent),
  staticData: {
    order: 3,
    title: '작업중',
  },
});

function RouteComponent() {
  return (
    <div>
      <div>hi</div>
    </div>
  );
}
