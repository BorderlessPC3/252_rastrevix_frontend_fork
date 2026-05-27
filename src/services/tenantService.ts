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

export type TenantBrandingUpdate = {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  faviconUrl?: string | null;
};

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

  async updateBranding(data: TenantBrandingUpdate): Promise<TenantBranding> {
    if (useFirebaseDirect()) {
      const user = await firebaseGetCurrentUser();
      return fb.updateTenantBranding(user?.tenantId, data);
    }

    const res = await apiService.request<{
      message: string;
      data: { tenant: TenantBranding };
    }>('/tenants/branding/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data.tenant;
  }
}

export const tenantService = new TenantService();
export default tenantService;
