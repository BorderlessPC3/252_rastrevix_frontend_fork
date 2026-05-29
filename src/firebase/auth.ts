import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { ensureFirestoreOnline, getDb, getFirebaseAuth } from './app';
import { COLLECTIONS } from './collections';
import { docToRecord, formatFirebaseError, toIso } from './helpers';
import { FirestoreRepo } from './repository';
import type { AuthResponse, LoginCredentials, RegisterData } from '../services/api';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

const usersRepo = new FirestoreRepo(COLLECTIONS.users);

function isFirestoreConnectivityError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (/database ['"][^'"]+['"]? not found/i.test(err.message)) return false;
  return /offline|unavailable|failed to get document because the client is offline/i.test(err.message);
}

async function withFirestoreRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  await ensureFirestoreOnline();
  let lastErr: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (isFirestoreConnectivityError(err) && i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
        await ensureFirestoreOnline();
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function mapUser(row: Record<string, unknown>): AppUser {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    role: String(row.role ?? 'user'),
    status: String(row.status ?? 'active'),
    phone: row.phone as string | undefined,
    company: row.company as string | undefined,
    position: row.position as string | undefined,
    department: row.department as string | undefined,
    tenantId: row.tenantId as string | undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt)
  };
}

async function loadProfileByUid(uid: string): Promise<AppUser | null> {
  const row = await withFirestoreRetry(() => usersRepo.getById(uid));
  if (!row) return null;
  return mapUser(row);
}

/** Usuário criado pelo backend (UUID ≠ uid do Firebase Auth). */
async function findLegacyUserByEmail(email: string): Promise<Record<string, unknown> | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const snap = await withFirestoreRetry(() =>
    getDocs(
      query(
        collection(getDb(), COLLECTIONS.users),
        where('email', '==', normalized),
        limit(1)
      )
    )
  );
  if (snap.empty) return null;
  const docSnap = snap.docs[0]!;
  return docToRecord(docSnap.id, docSnap.data() as Record<string, unknown>);
}

async function hasAnyUser(): Promise<boolean> {
  const snap = await withFirestoreRetry(() =>
    getDocs(query(collection(getDb(), COLLECTIONS.users), limit(1)))
  );
  return !snap.empty;
}

async function ensureProfile(
  firebaseUser: FirebaseUser,
  extra?: Partial<RegisterData>
): Promise<AppUser> {
  const uid = firebaseUser.uid;
  const email = (firebaseUser.email || extra?.email || '').trim().toLowerCase();

  const existing = await loadProfileByUid(uid);
  if (existing) {
    if (existing.status !== 'active') throw new Error('Conta inativa');
    await withFirestoreRetry(() =>
      usersRepo.update(uid, { lastLoginAt: new Date(), firebaseUid: uid })
    );
    const updated = await loadProfileByUid(uid);
    if (!updated) throw new Error('Não foi possível atualizar o perfil do usuário');
    return updated;
  }

  const legacy = email ? await findLegacyUserByEmail(email) : null;
  const firstUser = !(await hasAnyUser());
  const now = new Date();

  const base = {
    name:
      extra?.name ||
      String(legacy?.name ?? '') ||
      firebaseUser.displayName ||
      email.split('@')[0] ||
      'Usuário',
    email,
    role: legacy?.role ? String(legacy.role) : firstUser ? 'admin' : 'user',
    status: extra ? 'active' : legacy?.status ? String(legacy.status) : 'active',
    phone: extra?.phone ?? (legacy?.phone as string | undefined),
    company: extra?.company ?? (legacy?.company as string | undefined),
    position: extra?.position ?? (legacy?.position as string | undefined),
    department: extra?.department ?? (legacy?.department as string | undefined),
    tenantId: legacy?.tenantId as string | undefined,
    allowedClienteIds: legacy?.allowedClienteIds,
    firebaseUid: uid,
    createdAt: legacy?.createdAt ?? now,
    updatedAt: now
  };

  const saved = await withFirestoreRetry(() => usersRepo.save(uid, base));
  return mapUser(saved);
}

function buildAuthResponse(user: AppUser, accessToken: string): AuthResponse {
  return {
    message: 'OK',
    data: {
      user,
      accessToken,
      refreshToken: accessToken,
      expiresIn: 3600
    }
  };
}

export async function firebaseLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      credentials.email,
      credentials.password
    );
    const token = await cred.user.getIdToken();
    const profile = await ensureProfile(cred.user);
    return buildAuthResponse(profile, token);
  } catch (err: unknown) {
    console.error('[Firebase Auth] login:', err);
    throw new Error(formatFirebaseError(err));
  }
}

export async function firebaseRegister(data: RegisterData): Promise<AuthResponse> {
  let createdUser: FirebaseUser | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      data.email.trim(),
      data.password
    );
    createdUser = cred.user;
    const token = await cred.user.getIdToken();
    const profile = await ensureProfile(cred.user, data);
    return buildAuthResponse(profile, token);
  } catch (err: unknown) {
    console.error('[Firebase Auth] register:', err);
    if (createdUser && !isFirestoreConnectivityError(err)) {
      try {
        await deleteUser(createdUser);
      } catch (rollbackErr) {
        console.warn('[Firebase Auth] rollback deleteUser:', rollbackErr);
      }
    }
    throw new Error(formatFirebaseError(err));
  }
}

export async function firebaseLogout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function firebaseGetCurrentUser(): Promise<AppUser | null> {
  const auth = getFirebaseAuth();
  const fbUser = auth.currentUser;
  if (!fbUser?.email) return null;
  return loadProfileByUid(fbUser.uid);
}

export async function firebaseRefreshToken(): Promise<AuthResponse | null> {
  const auth = getFirebaseAuth();
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  const token = await fbUser.getIdToken(true);
  const profile = await loadProfileByUid(fbUser.uid);
  if (!profile) return null;
  if (profile.status !== 'active') throw new Error('Conta inativa');
  return buildAuthResponse(profile, token);
}

export async function firebaseGetAccessToken(): Promise<string | null> {
  const fbUser = getFirebaseAuth().currentUser;
  if (!fbUser) return null;
  return fbUser.getIdToken();
}

export function watchAuthState(onUser: (user: AppUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
    if (!fbUser?.email) {
      onUser(null);
      return;
    }
    try {
      const profile = await ensureProfile(fbUser);
      onUser(profile);
    } catch {
      onUser(null);
    }
  });
}

export async function firebaseUpdateProfile(
  userId: string,
  data: Record<string, unknown> | { name?: string; phone?: string; company?: string; position?: string; department?: string }
): Promise<AppUser> {
  const updated = await usersRepo.update(userId, data as Record<string, unknown>);
  return mapUser(updated);
}

export async function firebaseTestConnection(): Promise<boolean> {
  try {
    await usersRepo.getAll();
    return true;
  } catch {
    return false;
  }
}
