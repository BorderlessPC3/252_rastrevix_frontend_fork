const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  position?: string;
  department?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: {
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
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

const DEBUG = import.meta.env.DEV;

const log = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`[API Service] ${message}`, data || '');
  }
};

let refreshPromise: Promise<boolean> | null = null;

class ApiService {
  private baseURL: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    log('API Service initialized', { baseURL });
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      try {
        const url = `${this.baseURL}/auth/refresh`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) return false;

        const data = (await response.json()) as AuthResponse;
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
    isRetryAfterRefresh = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json'
    };

    const token = this.getAccessToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    log(`Making request to ${endpoint}`, {
      method: options.method || 'GET',
      retryCount,
      hasToken: !!token
    });

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !isRetryAfterRefresh && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          return this.request<T>(endpoint, options, retryCount, true);
        }
        this.clearTokens();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!response.ok) {
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            code: response.status.toString()
          };
        }

        if (
          retryCount < this.retryAttempts &&
          (response.status >= 500 || response.status === 0)
        ) {
          await this.delay(this.retryDelay * (retryCount + 1));
          return this.request<T>(endpoint, options, retryCount + 1, isRetryAfterRefresh);
        }

        throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (
        retryCount < this.retryAttempts &&
        error instanceof Error &&
        (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))
      ) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.request<T>(endpoint, options, retryCount + 1, isRetryAfterRefresh);
      }

      if (error instanceof Error) throw error;
      throw new Error('Erro de conexão com o servidor');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  }

  async getCurrentUser(): Promise<{ message: string; data: { user: AuthResponse['data']['user'] } }> {
    return this.request<{ message: string; data: { user: AuthResponse['data']['user'] } }>('/auth/me');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const healthUrl = this.baseURL.replace('/api', '') + '/health';
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getApiStatus() {
    return {
      baseURL: this.baseURL,
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken()
    };
  }
}

export const apiService = new ApiService();
export default apiService;
