import { apiService } from './api';

export interface UserProfileUpdate {
  name?: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
}

class UserService {
  async updateProfile(userId: string, data: UserProfileUpdate) {
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
