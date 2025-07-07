import { withBrand } from '#/routes/_public/-layout';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';

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
