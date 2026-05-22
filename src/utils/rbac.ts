import { ENABLED_APP_PATHS } from '../config/productMenu';

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
export const MANAGER_ROUTE_PREFIXES = [
  '/gerencia/integracao',
  '/cadastro',
  '/estoque'
] as const;

export function isEnabledAppPath(path: string): boolean {
  return (ENABLED_APP_PATHS as readonly string[]).includes(path);
}

export function canAccessPath(path: string, role?: string): boolean {
  if (!isEnabledAppPath(path)) return false;

  const r = normalizeRole(role);
  if (r === 'admin') return true;

  const needsManager = MANAGER_ROUTE_PREFIXES.some((p) => path.startsWith(p));
  if (needsManager) return hasMinimumRole(r, 'manager');

  return true;
}

export function canSeeIntegracao(role?: string): boolean {
  return hasMinimumRole(role, 'manager');
}

export function canManageCadastros(role?: string): boolean {
  return hasMinimumRole(role, 'manager');
}

/** Admin da plataforma (sem tenant) ou admin de um tenant */
export function canAdministerTenant(role?: string): boolean {
  return normalizeRole(role) === 'admin';
}

export function isGlobalAdminUser(user?: {
  role?: string;
  tenantId?: string | null;
}): boolean {
  return normalizeRole(user?.role) === 'admin' && !user?.tenantId;
}

export function canImportData(role?: string): boolean {
  return hasMinimumRole(role, 'manager');
}
