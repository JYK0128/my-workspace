import { initTrpcWebSocketServer, trpcExpressMiddleware, trpcExpressPanel } from '@packages/trpc';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';

export const bootstrap = () => {
  const port = +process.env.APP_PORT;

  /* 1] express 서버 세팅 */
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({
    origin: process.env.NODE_ENV !== 'production'
      ? ['http://localhost:5173', 'http://localhost:4173']
      : [],
    methods: ['GET', 'POST'],
    credentials: true,
  }));
  app.use(helmet());
  app.use(cookieParser());
  app.use(morgan('combined'));
  app.enable('trust proxy');

  app.use('/panel', trpcExpressPanel);
  app.use('/trpc', trpcExpressMiddleware);
  app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: 'Internal Server Error' });
  });

  const server = createServer(app);
  server.listen(port, () => {
    console.log('run express on', port);
  });

  /* 2] webSocket 서버 세팅 */
  initTrpcWebSocketServer({ port: port + 1 });
};
