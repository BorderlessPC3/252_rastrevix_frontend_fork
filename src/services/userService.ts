import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import { firebaseUpdateProfile } from '../firebase/auth';

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
}

class UserService {
  async updateProfile(userId: string, data: UserProfileUpdate) {
    if (useFirebaseDirect()) {
      const user = await firebaseUpdateProfile(userId, { ...data });
      return { message: 'Perfil atualizado', data: { user } };
    }

    return apiService.request<{ message: string; data: { user: unknown } }>(
      `/users/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      }
    );
  }
}

export const userService = new UserService();
export default userService;
