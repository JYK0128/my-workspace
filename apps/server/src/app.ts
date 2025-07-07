import { trpcExpressMiddleware, trpcExpressPanel, trpcWebSocketMiddleware } from '@packages/trpc';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

const port = +process.env.APP_PORT!;

export const bootstrap = () => {
  /* 1] express 서버 세팅 */
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
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
  const wss = new WebSocketServer({ port: port + 1 });
  trpcWebSocketMiddleware(wss);

  // 웹소켓 서버 시작
  wss.on('listening', () => {
    console.log('wsServer started: ', wss.clients.size);
  });

  // 웹소켓 서버 연결
  wss.on('connection', (ws) => {
    console.log('wsClient connected: ', wss.clients.size);

    // 웹소켓 클라이언트 메시지 수신
    ws.on('message', (data) => {
      console.log('wsClient data received: ', data.toString());
    });

    // 웹소켓 클라이언트 종료
    ws.on('close', () => {
      console.log('wsClient closed: ', wss.clients.size);
    });
  });

  // 웹소켓 서버 종료
  wss.on('close', () => {
    console.log('wsServer closed: ', wss.clients.size);
  });
};
