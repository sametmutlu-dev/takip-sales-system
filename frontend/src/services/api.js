import axios from 'axios';

// API base URL - Production için environment variable kullan
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-app.vercel.app/api'
  : 'http://localhost:3001/api';

// API Key - Production için environment variable kullan
const API_KEY = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_KEY || 'your_production_api_key'
  : 'your_api_key_here_change_this_in_production';

console.log('🔧 API Configuration:', { API_BASE_URL, API_KEY, NODE_ENV: process.env.NODE_ENV });

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    console.error('🔍 Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    
    return Promise.reject(error);
  }
);

// Sales API functions
export const salesAPI = {
  // Tüm satışları getir
  getAll: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Tek satış getir
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Yeni satış oluştur
  create: async (saleData) => {
    console.log('📝 Creating sale:', saleData);
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Satış güncelle
  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // Satış sil
  delete: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  // İstatistikler
  getStats: async (params = {}) => {
    const response = await api.get('/sales/stats/overview', { params });
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
