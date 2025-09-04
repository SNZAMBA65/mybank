import axios from 'axios';

// URL relative pour utiliser le proxy Vite
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // facultatif si cookies/token
});

// Types pour l'API
export interface ApiUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ApiAccount {
  id: number;
  name: string;
  type: string;
  balance: string;
  currency: string;
  accountNumber: string;
}

export interface ApiCategory {
  id: number;
  title: string;
}

export interface ApiOperation {
  id: number;
  label: string;
  amount: string;
  date: string;
  category: ApiCategory;
  account?: ApiAccount;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface CreateOperationRequest {
  label: string;
  amount: string;
  date: string;
  categoryId: number;
  accountId?: number;
}

export interface CreateAccountRequest {
  name: string;
  type: string;
  balance?: string;
  currency?: string;
}

// Services d'authentification
export const authService = {
  async login(data: LoginRequest): Promise<{ message: string; user: ApiUser }> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<{ message: string; user: ApiUser }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  async me(): Promise<ApiUser> {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Services des comptes
export const accountService = {
  async getAll(): Promise<ApiAccount[]> {
    const response = await api.get('/accounts');
    return response.data;
  },

  async getById(id: number): Promise<ApiAccount> {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  async create(data: CreateAccountRequest): Promise<ApiAccount> {
    const response = await api.post('/accounts', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateAccountRequest>): Promise<ApiAccount> {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`);
  }
};

// Services des catégories
export const categoryService = {
  async getAll(): Promise<ApiCategory[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async create(title: string): Promise<ApiCategory> {
    const response = await api.post('/categories', { title });
    return response.data;
  }
};

// Services des opérations
export const operationService = {
  async getAll(): Promise<ApiOperation[]> {
    const response = await api.get('/operations');
    return response.data;
  },

  async create(data: CreateOperationRequest): Promise<ApiOperation> {
    const response = await api.post('/operations', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateOperationRequest>): Promise<ApiOperation> {
    const response = await api.put(`/operations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/operations/${id}`);
  }
};

export default api;