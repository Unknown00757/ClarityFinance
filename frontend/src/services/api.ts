import { User, Category, Transaction, Budget, AnalyticsSummary, ExportData } from '../types';

const API_BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ access_token: string; token_type: string }>(res);
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ access_token: string; token_type: string }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse<User>(res);
  },

  updateProfile: async (data: Partial<User>) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Transactions
  getTransactions: async (params?: {
    search?: string;
    type?: string;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => {
    const urlParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          urlParams.append(key, String(value));
        }
      });
    }
    const res = await fetch(`${API_BASE_URL}/transactions?${urlParams.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<{
      items: Transaction[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(res);
  },

  createTransaction: async (data: Omit<Transaction, 'id' | 'user_id' | 'category'>) => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Transaction>(res);
  },

  updateTransaction: async (id: number, data: Partial<Transaction>) => {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Transaction>(res);
  },

  deleteTransaction: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Budget[]>(res);
  },

  createBudget: async (data: { category_id: number; amount: number; start_date: string; end_date: string }) => {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(res);
  },

  updateBudget: async (id: number, data: Partial<{ category_id: number; amount: number; start_date: string; end_date: string }>) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Budget>(res);
  },

  deleteBudget: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Category[]>(res);
  },

  createCategory: async (data: { name: string; icon: string; type: string }) => {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Category>(res);
  },

  deleteCategory: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Analytics
  getAnalyticsSummary: async (month?: string, range_type?: string) => {
    const urlParams = new URLSearchParams();
    if (month) urlParams.append('month', month);
    if (range_type) urlParams.append('range_type', range_type);
    const res = await fetch(`${API_BASE_URL}/analytics/summary?${urlParams.toString()}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<AnalyticsSummary>(res);
  },

  // Settings
  exportData: async () => {
    const res = await fetch(`${API_BASE_URL}/settings/export`, {
      headers: getAuthHeader(),
    });
    return handleResponse<ExportData>(res);
  },

  clearData: async () => {
    const res = await fetch(`${API_BASE_URL}/settings/clear-data`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },
};
