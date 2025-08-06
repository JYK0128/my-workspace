import * as trpcExpress from '@trpc/server/adapters/express';
import { RequestHandler } from 'express';
import { renderTrpcPanel } from 'trpc-ui';

import { createContextInner } from '#core/trpc.ts';
import { MainRouter } from '#router/index.ts';


const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const userAgent = req.get('user-agent');
  const userIp = req.ip;
  if (!userAgent || !userIp) throw Error('unknown Agent or IP');

  const accessToken = req.headers['authorization']?.replace('Bearer ', '').replace('undefined', '');
  const context = createContextInner({ userAgent, userIp, accessToken });
  return { req, res, ...context };
};
export type ExpressContext = Awaited<ReturnType<typeof createContext>>;

export const trpcExpressMiddleware = trpcExpress.createExpressMiddleware({
  router: MainRouter,
  createContext,
  // 서버 로깅
  onError: (opts) => {
    if (process.env.NODE_ENV === 'production') {
      delete opts.error.stack;
    }
  },
});

export const trpcExpressPanel: RequestHandler = (_, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).send('Not Found');
  }
  else {
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval'; worker-src blob:;`,
    );

    res.send(
      renderTrpcPanel(MainRouter, {
        url: `${process.env.APP_HOST}:${process.env.APP_PORT}/trpc`,
        meta: {
          title: 'trpc docs',
        },
      }),
    );
  }
};
