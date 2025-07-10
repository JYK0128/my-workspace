import { ServerOptions, WebSocketServer } from 'ws';

export let wss: Optional<WebSocketServer>;
export const createWSServer = (options: ServerOptions) => {
  wss = new WebSocketServer(options);

  // 웹소켓 서버 시작
  wss.on('listening', () => {
    console.log('wsServer started: ', wss?.clients.size);
  });

  // 웹소켓 서버 연결
  wss.on('connection', (ws) => {
    console.log('wsClient connected: ', wss?.clients.size);

    // 웹소켓 클라이언트 메시지 수신
    ws.on('message', (msg) => {
      console.log('wsClient data received: ', msg);
    });

    ws.on('error', (err) => {
      console.error('wsClient error: ', err);
    });

    // 웹소켓 클라이언트 종료
    ws.on('close', () => {
      console.log('wsClient closed: ', wss?.clients.size);
    });
  });

  // 웹소켓 서버 오류
  wss.on('error', (err) => {
    console.error('wsServer error: ', err);
  });

  // 웹소켓 서버 종료
  wss.on('close', () => {
    console.log('wsServer closed: ', wss?.clients.size);
  });

  return wss;
};

