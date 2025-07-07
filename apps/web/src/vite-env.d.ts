/// <reference types="vite/client" />
/// <reference types="@packages/utils" />

/* Env 타입 */
interface ImportMetaEnv {
  VITE_API_URL: string
  VITE_OIDC_AUTHORITY: string
  VITE_OIDC_CLIENT_ID: string
  VITE_OIDC_SCOPE: string
};
interface ImportMeta {
  readonly env: ImportMetaEnv
}
