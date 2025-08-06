import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';

import { withBrand } from '#/routes/_public/-layout';

export const Route = createFileRoute('/_public')({
  component: withBrand(RouteComponent),
});

function RouteComponent() {
  return (
    <Suspense>
      <Outlet />
    </Suspense>
  );
}
