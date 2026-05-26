/** true em build de produção (Vite) */
export const isProduction =
  import.meta.env.PROD || import.meta.env.MODE === 'production';

/** Cadastro público: dev, flag explícita, ou Firebase direto (auth no client) */
export const isPublicRegisterEnabled =
  import.meta.env.VITE_USE_FIREBASE === 'true' ||
  !isProduction ||
  import.meta.env.VITE_ALLOW_PUBLIC_REGISTER === 'true';
