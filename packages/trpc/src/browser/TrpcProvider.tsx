import { getQueryClient, getTRPCClient, TRPCProvider } from '#browser/react.ts';
import { keepPreviousData, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, useState } from 'react';


export function ReactTrpcProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => getQueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false, throwOnError: false, placeholderData: keepPreviousData },
      mutations: { retry: false, throwOnError: false },
    },
  }));
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {children}
        </TRPCProvider>
      </QueryClientProvider>
      <ReactQueryDevtools client={queryClient} initialIsOpen={false} />
    </>
  );
}
