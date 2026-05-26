import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import { firebaseGetCurrentUser } from '../firebase/auth';
import * as fb from '../firebase/entities';

export interface TenantBranding {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl?: string;
}

class TenantService {
  async getBranding(): Promise<TenantBranding | null> {
    if (useFirebaseDirect()) {
      const user = await firebaseGetCurrentUser();
      return fb.getTenantBranding(user?.tenantId);
    }

    const res = await apiService.request<{
      message: string;
      data: { tenant: TenantBranding | null };
    }>('/tenants/branding/me');
    return res.data.tenant;
  }
}

export const tenantService = new TenantService();
export default tenantService;
