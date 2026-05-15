export type UserRole = 'admin' | 'manager' | 'user';

const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  user: 1
};

export function normalizeRole(role?: string): UserRole {
  if (role === 'admin' || role === 'manager' || role === 'user') return role;
  return 'user';
}

export function hasMinimumRole(userRole: string | undefined, minimum: UserRole): boolean {
  const u = normalizeRole(userRole);
  return ROLE_RANK[u] >= ROLE_RANK[minimum];
}

/** Rotas que exigem pelo menos manager */
export const MANAGER_ROUTES = [
  '/gerencia/integracao',
  '/cadastro/cliente',
  '/estoque',
];

/** Rotas exclusivas admin */
export const ADMIN_ROUTES: string[] = [];

export function canAccessPath(path: string, role?: string): boolean {
  const r = normalizeRole(role);
  if (r === 'admin') return true;

  const isAdminOnly = ADMIN_ROUTES.some((p) => path.startsWith(p));
  if (isAdminOnly) return false;

  const needsManager = MANAGER_ROUTES.some((p) => path.startsWith(p));
  if (needsManager) return hasMinimumRole(r, 'manager');

  return true;
}

export function canSeeIntegracao(role?: string): boolean {
  return hasMinimumRole(role, 'manager');
}

export function canManageCadastros(role?: string): boolean {
  return hasMinimumRole(role, 'manager');
}
