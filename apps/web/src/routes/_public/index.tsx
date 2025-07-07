import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/')({
  beforeLoad: () => {
    throw redirect({ to: '/home' });
  },
});
