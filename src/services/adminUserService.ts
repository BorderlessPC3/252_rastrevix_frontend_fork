import { useFirebaseDirect } from '../config/firebase';
import {
  createManagedUser,
  hasPlatformAdmin,
  listManagedUsers,
  promoteUserToAdmin,
  type CreateManagedUserInput
} from '../firebase/adminUsers';
import type { AppUser } from '../firebase/auth';
import { apiService } from './api';

class AdminUserService {
  async hasPlatformAdmin(): Promise<boolean> {
    if (useFirebaseDirect()) return hasPlatformAdmin();
    try {
      const res = await apiService.request<{
        data: { users: { role: string; status?: string }[] };
      }>('/users?role=admin&limit=1');
      return (res.data?.users?.length ?? 0) > 0;
    } catch {
      return false;
    }
  }

  async listUsers(): Promise<AppUser[]> {
    if (useFirebaseDirect()) return listManagedUsers();
    const res = await apiService.request<{ data: { users: AppUser[] } }>('/users?limit=200');
    return res.data.users;
  }

  async promoteToAdmin(userId: string): Promise<AppUser> {
    if (useFirebaseDirect()) return promoteUserToAdmin(userId);
    const res = await apiService.request<{ data: { user: AppUser } }>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role: 'admin' })
    });
    return res.data.user;
  }

  async createUser(input: CreateManagedUserInput): Promise<AppUser> {
    if (useFirebaseDirect()) return createManagedUser(input);
    const res = await apiService.request<{ data: { user: AppUser } }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role
      })
    });
    return res.data.user;
  }
}

export const adminUserService = new AdminUserService();
