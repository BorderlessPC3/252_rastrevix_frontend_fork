import { Timestamp } from 'firebase/firestore';

export function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'object' && value !== null && '_seconds' in value) {
    const ts = value as { _seconds: number };
    return new Date(ts._seconds * 1000).toISOString();
  }
  return String(value);
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object' && value !== null && '_seconds' in value) {
    return new Date((value as { _seconds: number })._seconds * 1000);
  }
  return null;
}

export function docToRecord(id: string, data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      out[key] = value.toDate().toISOString();
    } else if (value instanceof Date) {
      out[key] = value.toISOString();
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function matchesSearch(row: Record<string, unknown>, search: string, fields: string[]): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => String(row[field] ?? '').toLowerCase().includes(q));
}

export function paginate<T>(
  items: T[],
  page = 1,
  limit = 20
): { items: T[]; page: number; limit: number; total: number; pages: number } {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    page: safePage,
    limit,
    total,
    pages
  };
}

export function newId(): string {
  return crypto.randomUUID();
}

export function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciais inválidas';
    case 'auth/email-already-in-use':
      return 'Email já está em uso. Tente fazer login.';
    case 'auth/weak-password':
      return 'Senha deve ter pelo menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/operation-not-allowed':
      return 'Cadastro por email/senha não está habilitado no Firebase Console (Authentication → Sign-in method).';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão.';
    case 'auth/admin-restricted-operation':
      return 'Operação restrita pelo administrador do projeto Firebase.';
    case 'permission-denied':
      return 'Sem permissão no Firestore. Publique as regras no banco prov-252 e confira se está logado.';
    default:
      return `Erro de autenticação (${code || 'desconhecido'})`;
  }
}

/** Mensagem legível para erros do Firebase Auth, Firestore ou Error genérico. */
export function formatFirebaseError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code ?? '');
    if (code.startsWith('auth/') || code === 'permission-denied') {
      return mapFirebaseAuthError(code);
    }
  }

  if (err instanceof Error) {
    const msg = err.message;
    if (/permission|PERMISSION_DENIED|insufficient/i.test(msg)) {
      return 'Sem permissão no Firestore. Publique firestore.rules no projeto e use o banco prov-252.';
    }
    if (msg && msg !== 'Erro de autenticação') return msg;
  }

  return 'Erro de autenticação. Abra o console do navegador (F12) para mais detalhes.';
}
