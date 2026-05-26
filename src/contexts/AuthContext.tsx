import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService, type LoginCredentials, type RegisterData } from '../services/api';
import { socketService } from '../services/socketService';
import { useFirebaseDirect } from '../config/firebase';
import { watchAuthState } from '../firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectRealtime = async (accessToken?: string) => {
    try {
      const token = accessToken || (await apiService.getAccessTokenAsync()) || undefined;
      if (token) socketService.connect(token);
    } catch (err) {
      console.warn('WebSocket não conectado:', err);
    }
  };

  useEffect(() => {
    const onSessionInvalid = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setIsAuthenticated(false);
      setUser(null);
      setError(detail?.message || 'Sessão expirada. Faça login novamente.');
      socketService.disconnect();
    };

    window.addEventListener('auth:session-invalid', onSessionInvalid);

    if (useFirebaseDirect()) {
      const unsubscribe = watchAuthState((profile) => {
        if (profile && profile.status === 'active') {
          setIsAuthenticated(true);
          setUser(profile);
          void connectRealtime();
        } else {
          setIsAuthenticated(false);
          setUser(null);
          socketService.disconnect();
        }
        setLoading(false);
      });
      return () => {
        window.removeEventListener('auth:session-invalid', onSessionInvalid);
        unsubscribe();
      };
    }

    // Check authentication status on mount (modo API/JWT)
    const checkAuth = async () => {
      const accessToken = apiService.getAccessToken();
      const refreshToken = apiService.getRefreshToken();
      
      if (accessToken && !apiService.isTokenExpired(accessToken)) {
        try {
          const response = await apiService.getCurrentUser();
          setIsAuthenticated(true);
          setUser(response.data.user);
          void connectRealtime(accessToken);
        } catch (error) {
          console.error('Error validating token:', error);
          // Try to refresh token if we have one
          if (refreshToken) {
            try {
              const refreshResponse = await apiService.refreshToken(refreshToken);
              apiService.setTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);
              setIsAuthenticated(true);
              setUser(refreshResponse.data.user);
              void connectRealtime(refreshResponse.data.accessToken);
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              apiService.clearTokens();
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            apiService.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else if (refreshToken) {
        // Access token expired but we have refresh token
        try {
          const refreshResponse = await apiService.refreshToken(refreshToken);
          apiService.setTokens(refreshResponse.data.accessToken, refreshResponse.data.refreshToken);
          setIsAuthenticated(true);
          setUser(refreshResponse.data.user);
          void connectRealtime(refreshResponse.data.accessToken);
        } catch (error) {
          console.error('Error refreshing token:', error);
          apiService.clearTokens();
          socketService.disconnect();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // No tokens available
        apiService.clearTokens();
        socketService.disconnect();
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();

    return () => {
      window.removeEventListener('auth:session-invalid', onSessionInvalid);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.login(credentials);
      
      // Store tokens
      apiService.setTokens(response.data.accessToken, response.data.refreshToken);
      
      // Update state
      setIsAuthenticated(true);
      setUser(response.data.user);
      void connectRealtime(response.data.accessToken);
    } catch (error) {
      let errorMessage = 'Erro no login';
      
      if (error instanceof Error) {
        if (error.message.includes('Credenciais inválidas')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais.';
        } else if (error.message.includes('Conta inativa')) {
          errorMessage = 'Sua conta está inativa. Entre em contato com o administrador.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.register(data);
      
      // Store tokens
      apiService.setTokens(response.data.accessToken, response.data.refreshToken);
      
      // Update state
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      let errorMessage = 'Erro no registro';
      
      if (error instanceof Error) {
        if (error.message.includes('Email já está em uso')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('Dados de entrada inválidos')) {
          errorMessage = 'Verifique os dados informados e tente novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = apiService.getRefreshToken();
      if (refreshToken) {
        await apiService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Clear tokens and state regardless of API call success
      apiService.clearTokens();
      socketService.disconnect();
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
