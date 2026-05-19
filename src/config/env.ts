/** true em build de produção (Vite) */
export const isProduction =
  import.meta.env.PROD || import.meta.env.MODE === 'production';

/** Cadastro público permitido apenas fora de produção ou com flag explícita */
export const isPublicRegisterEnabled =
  !isProduction || import.meta.env.VITE_ALLOW_PUBLIC_REGISTER === 'true';
