import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut
} from 'firebase/auth';
import { firebaseConfig } from './app';
import { COLLECTIONS } from './collections';
import { formatFirebaseError, toIso } from './helpers';
import { FirestoreRepo } from './repository';
import type { AppUser } from './auth';

const usersRepo = new FirestoreRepo(COLLECTIONS.users);
const SECONDARY_APP_NAME = 'RastrevixUserProvisioner';

export type ManagedUserRole = 'admin' | 'manager';

export interface CreateManagedUserInput {
  name: string;
  email: string;
  password: string;
  role: ManagedUserRole;
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

export async function hasPlatformAdmin(): Promise<boolean> {
  const rows = await usersRepo.getAll();
  return rows.some(
    (r) => String(r.role) === 'admin' && String(r.status ?? 'active') === 'active'
  );
}

export async function listManagedUsers(): Promise<AppUser[]> {
  const rows = await usersRepo.getAll();
  return rows
    .map(mapUser)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function promoteUserToAdmin(userId: string): Promise<AppUser> {
  const updated = await usersRepo.update(userId, { role: 'admin', status: 'active' });
  return mapUser(updated);
}

export async function createManagedUser(input: CreateManagedUserInput): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  const secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      input.password
    );
    const uid = cred.user.uid;
    const now = new Date();

    const saved = await usersRepo.save(uid, {
      name: input.name.trim(),
      email,
      role: input.role,
      status: 'active',
      firebaseUid: uid,
      createdAt: now,
      updatedAt: now
    });

    await signOut(secondaryAuth);
    return mapUser(saved);
  } catch (err: unknown) {
    throw new Error(formatFirebaseError(err));
  } finally {
    await deleteApp(secondaryApp);
  }
}
