import App from '#/App';
import { Route as ProtectedRoute } from '#/routes/_protected';
import { Route as PublicRoute } from '#/routes/_public';
import { appendRoute, createRouteByData } from '#/routeTools';
import { routeTree } from '#/routeTree.gen.ts';
import { createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProviderProps } from 'react-oidc-context';

declare module '@tanstack/react-router' {
  interface Register {
    router: Awaited<ReturnType<typeof bootstrap>>
  }

  interface StaticDataRouteOption {
    title?: string
    order?: number
  }
}

async function bootstrap() {
  const baseURL = import.meta.env.VITE_API_URL;
  const data = await fetch(`${baseURL}/trpc/routers`)
    .then((res) => res.json())
    .then(({ result }) => Array.isArray(result.data) ? result.data : []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route = data.map((d: any) => createRouteByData(d));
  appendRoute(PublicRoute, route);
  appendRoute(ProtectedRoute, []);

  const router = createRouter({
    basepath: import.meta.env.BASE_URL,
    routeTree,
    context: {
      auth: undefined!,
      trpc: undefined!,
      queryClient: undefined!,
    },
  });

  const oidcConfig: AuthProviderProps = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: `${window.location.origin}/login/callback`,
    response_type: 'code',
    scope: import.meta.env.VITE_OIDC_SCOPE,
    post_logout_redirect_uri: `${window.location.origin}/logout/callback`,
    matchSignoutCallback: () => window.location.pathname === '/logout/callback',
  };

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App oidcConfig={oidcConfig} router={router} />
    </StrictMode>,
  );

  return router;
}

bootstrap();
