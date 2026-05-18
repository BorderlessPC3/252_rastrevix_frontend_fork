import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { tenantService, type TenantBranding } from '../services/tenantService';
import { useAuth } from './AuthContext';

interface ThemeContextValue {
  branding: TenantBranding | null;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyBranding(branding: TenantBranding | null): void {
  const root = document.documentElement;
  const primary = branding?.primaryColor || '#00d9ff';
  const secondary = branding?.secondaryColor || '#0f172a';
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--accent-primary', primary);

  const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (favicon && branding?.faviconUrl) {
    favicon.href = branding.faviconUrl;
  }

  if (branding?.name) {
    document.title = `${branding.name} — Gestão de Frotas`;
  }
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshBranding = async () => {
    try {
      setLoading(true);
      const data = await tenantService.getBranding();
      setBranding(data);
      applyBranding(data);
    } catch {
      applyBranding(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshBranding();
    } else {
      applyBranding(null);
      setBranding(null);
    }
  }, [isAuthenticated]);

  return (
    <ThemeContext.Provider value={{ branding, loading, refreshBranding }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  return ctx;
}
