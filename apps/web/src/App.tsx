import '#/App.css';

import { ReactTrpcProvider, setToken, useMutation, useQueryClient, useTRPC } from '@packages/trpc';
import { Message } from '@packages/ui';
import { has } from '@packages/utils';
import { type RegisteredRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { User } from 'oidc-client-ts';
import { type PropsWithChildren, Suspense, useEffect } from 'react';
import { AuthProvider, type AuthProviderProps, useAuth } from 'react-oidc-context';


function InnerApp({ router }: Pick<AppProps, 'router'>) {
  const auth = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  useEffect(() => {
    setToken(auth.user?.['access_token']);
  }, [auth.user]);

  return (
    !auth.isLoading && (
      <>
        <RouterProvider router={router} context={{ auth, trpc, queryClient }} />
        <TanStackRouterDevtools router={router} initialIsOpen={false} />
        <Message />
      </>
    )
  );
}

function AuthWrapper({ children, oidcConfig }: PropsWithChildren<Pick<AppProps, 'oidcConfig'>>) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutateAsync: login } = useMutation(trpc.login.mutationOptions());

  /** 로그인 callback */
  const onSigninCallback: AuthProviderProps['onSigninCallback'] = (user) => {
    oidcConfig.onSigninCallback?.(user);
    login();
  };

  /** 로그아웃 callback */
  const onSignoutCallback: AuthProviderProps['onSignoutCallback'] = (resp) => {
    oidcConfig.onSignoutCallback?.(resp);
    const options = trpc.logout.mutationOptions();

    queryClient.getMutationCache().build(
      queryClient,
      {
        ...options,
        mutationFn: async () => {
          if (!options.mutationFn) return Promise.reject(new Error('No Function'));
          if (!has<User>(resp?.userState)) return Promise.reject(new Error('No User'));
          setToken(resp.userState['access_token']);

          const res = await options.mutationFn();
          setToken();
          return res;
        },
      },
    ).execute();
  };

  return (
    <AuthProvider
      {...oidcConfig}
      onSigninCallback={onSigninCallback}
      onSignoutCallback={onSignoutCallback}
    >
      {children}
    </AuthProvider>
  );
}

type AppProps = {
  router: RegisteredRouter
  oidcConfig: AuthProviderProps
};

function App({ oidcConfig, router }: AppProps) {
  return (
    <Suspense>
      <ReactTrpcProvider>
        <AuthWrapper oidcConfig={oidcConfig}>
          <InnerApp router={router} />
        </AuthWrapper>
      </ReactTrpcProvider>
    </Suspense>
  );
}

export default App;
