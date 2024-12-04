import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';

const BASE_URL = 'http://10.0.2.2:3000/api'; // 실제 서버 주소로 변경 필요

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  handonhand: string;
  description: string;
  seller_name: string;
  created_at: string;
}


export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },
  
  register: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('Attempting registration with:', credentials);
      const response = await api.post<LoginResponse>('/auth/register', credentials);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },

  withdraw: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.delete('/auth/withdraw', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.message || '회원탈퇴에 실패했습니다.');
      }
      throw error;
    }
  },
  

  // 토큰 저장을 위한 유틸리티 함수들
  setToken: async (token: string) => {
    await AsyncStorage.setItem('userToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: async () => {
    return await AsyncStorage.getItem('userToken');
  },

  removeToken: async () => {
    await AsyncStorage.removeItem('userToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const productService = {
  // 상품 목록 조회
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // 상품 상세 조회
  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 상품 등록
  createProduct: async (productData: Omit<Product, 'id' | 'seller_name' | 'created_at'>) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await api.post('/products', productData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default api;