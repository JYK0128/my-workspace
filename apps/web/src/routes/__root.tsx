import { getQueryClient, useTRPC } from '@packages/trpc';
import { createRootRouteWithContext } from '@tanstack/react-router';
import { AuthContextProps } from 'react-oidc-context';

import { ErrorPage } from '#/routes/_public/-error';
import { NotFoundPage } from '#/routes/_public/-not-found';

type AppContext = {
  auth: AuthContextProps
  trpc: ReturnType<typeof useTRPC>
  queryClient: ReturnType<typeof getQueryClient>
};
export const Route = createRootRouteWithContext<AppContext>()({
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
});
