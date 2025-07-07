import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/logout/callback')({
  beforeLoad() {
    throw redirect({
      to: '/',
    });
  },
});

