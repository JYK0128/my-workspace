export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string

      APP_NAME: string
      APP_HOST: string
      APP_PORT: string
      APP_AUTH_URL: string
      DATABASE_URL: string

      APP_GOOGLE_API: string
      APP_GOOGLE_KEY: string

      APP_OPEN_ROUTER_API: string
      APP_OPEN_ROUTER_KEY: string

      APP_MAIL_USER: string
      APP_MAIL_ID: string
      APP_MAIL_SECRET: string
      APP_MAIL_REFRESH: string
    }
  }
}
