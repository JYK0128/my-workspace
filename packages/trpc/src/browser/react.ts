import { MainRouter } from '#router/index.ts';
import { QueryClient, QueryClientConfig } from '@tanstack/react-query';
import { createTRPCClient, createWSClient, httpBatchLink, httpBatchStreamLink, httpLink, httpSubscriptionLink, isNonJsonSerializable, loggerLink, splitLink } from '@trpc/client';
import { defaultTransformer } from '@trpc/server/unstable-core-do-not-import';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { EventSourcePolyfill } from 'event-source-polyfill';
import SuperJSON from 'superjson';


export let token: string | undefined;
export function setToken(newToken?: string) {
  token = newToken;
}

const socket = createWSClient({
  url: import.meta.env.VITE_WS_URL,
  connectionParams: () => ({
    Authorization: token && `Bearer ${token}`,
  }),
  lazy: {
    enabled: true,
    closeMs: 0,
  },
});

const baseURL = import.meta.env.VITE_API_URL;
export const getTRPCClient = () => createTRPCClient<MainRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        (process.env.NODE_ENV === 'development' && typeof window !== 'undefined')
        || (opts.direction === 'down' && opts.result instanceof Error),
    }),
    splitLink({
      condition: (op) => op.type === 'subscription',
      /* WS 통신 */
      // true: wsLink({
      //   client: socket,
      //   transformer: SuperJSON,
      // }),
      /* SSE 통신 */
      true: httpSubscriptionLink({
        url: `${baseURL}/trpc`,
        transformer: SuperJSON,
        EventSource: EventSourcePolyfill,
        eventSourceOptions: async ({ op }) => {
          return {
            headers: {
              Authorization: (token && `Bearer ${token}`) as string,
            },
          };
        },
      }),
      false: splitLink({
        condition: (op) => op.context.stream,
        true: httpBatchStreamLink({
          url: `${baseURL}/trpc`,
          headers: () => ({
            Authorization: token && `Bearer ${token}`,
          }),
          transformer: SuperJSON,
        }),
        false: splitLink({
          condition: (op) => isNonJsonSerializable(op.input),
          true: httpLink({
            url: `${baseURL}/trpc`,
            headers: () => ({
              Authorization: token && `Bearer ${token}`,
            }),
            transformer: defaultTransformer,
          }),
          false: httpBatchLink({
            url: `${baseURL}/trpc`,
            headers: () => ({
              Authorization: token && `Bearer ${token}`,
            }),
            transformer: SuperJSON,
          }),
        }),
      }),
    }),
  ],
});

let browserQueryClient: QueryClient | undefined = undefined;
export function getQueryClient(config?: QueryClientConfig) {
  if (typeof window === 'undefined') {
    return new QueryClient(config);
  }
  else {
    if (!browserQueryClient) browserQueryClient = new QueryClient(config);
    return browserQueryClient;
  }
}

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<MainRouter>();
export * from '@tanstack/react-query';

