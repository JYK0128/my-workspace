export { };

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_WS_URL: string
  };
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

declare module '@trpc/client' {
  interface OperationContext {
    stream: boolean
  }
}
