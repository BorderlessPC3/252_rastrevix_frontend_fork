import { apiService } from './api';

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
    const res = await apiService.request<{
      message: string;
      data: { tenant: TenantBranding | null };
    }>('/tenants/branding/me');
    return res.data.tenant;
  }
}

export const tenantService = new TenantService();
export default tenantService;
