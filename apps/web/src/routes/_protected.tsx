import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context: { auth }, location }) => {
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense>
      <Outlet />
    </Suspense>
  );
}
