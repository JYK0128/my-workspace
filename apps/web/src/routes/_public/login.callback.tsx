import { createFileRoute, redirect } from '@tanstack/react-router';
import { User } from 'oidc-client-ts';

function hasRedirect(user: User | null | undefined): user is User & { state: { redirect: string } } {
  return typeof user?.state === 'object' && user?.state !== null && 'redirect' in user.state;
}

export const Route = createFileRoute('/_public/login/callback')({
  beforeLoad: ({ context: { auth } }) => {
    const { isAuthenticated, user } = auth;
    if (isAuthenticated && user) {
      throw redirect({
        to: hasRedirect(user)
          ? user.state.redirect
          : '/',
      });
    }
    else {
      throw redirect({ to: '/' });
    }
  },
});
