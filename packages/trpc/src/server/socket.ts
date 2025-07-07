import { createContextInner } from '#core/trpc.ts';
import { MainRouter } from '#router/index.ts';
import * as trpcWs from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';


const createContext = ({ req, res, info }: trpcWs.CreateWSSContextFnOptions) => {
  const userAgent = req.headers['user-agent'];
  const userIp = req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
    ?? req.socket.remoteAddress;
  if (!userAgent || !userIp) throw Error('unknown Agent or IP');

  const accessToken = info.connectionParams?.['Authorization']?.replace('Bearer ', '').replace('undefined', '');
  const context = createContextInner({ userAgent, userIp, accessToken });
  return { req, res, ...context };
};
export type SocketContext = Awaited<ReturnType<typeof createContext>>;

export const trpcWebSocketMiddleware = (wss: WebSocketServer) => trpcWs.applyWSSHandler({
  wss,
  createContext,
  router: MainRouter,
});
