import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';

const BASE_URL = 'http://10.0.2.2:3000/api'; 
// const BASE_URL = 'http://noum.iptime.org:9000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '/api/placeholder/150/150';
  
  const baseUrl = Platform.select({
    android: 'http://10.0.2.2:3000', //'http://noum.iptime.org:9000'
    ios: 'http://localhost:3000', //'http://noum.iptime.org:9000'
    default: 'http://localhost:3000' //'http://noum.iptime.org:9000'로 변경
  });
  
  return `${baseUrl}${imagePath}`;
};

export interface LoginResponse {
  user: {
    id: number;
    username: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  handonhand: string;
  description: string;
  seller_name: string;
  created_at: string;
  images: string[];
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
  chatroom_id: number;
}

export interface ChatRoom {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  product_title: string;
  product_price: number;
  buyer_name: string;
  seller_name: string;
  last_message?: {
    content: string;
    created_at: string;
  };
}

export interface FormattedProduct extends Omit<Product, 'images'> {
  imageUrls: string[];
  thumbnailUrl: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },
  
  register: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
  }
};

export const productService = {
  formatProduct: (product: Product): FormattedProduct => {
    return {
      ...product,
      imageUrls: product.images?.map(getImageUrl) || [],
      thumbnailUrl: product.images?.[0] ? getImageUrl(product.images[0]) : '/api/placeholder/150/150'
    };
  },

  // 상품 목록 조회
  getProducts: async (): Promise<FormattedProduct[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data.map(productService.formatProduct);
  },

  // 상품 상세 조회
  getProduct: async (id: number): Promise<FormattedProduct> => {
    const response = await api.get<Product>(`/products/${id}`);
    return productService.formatProduct(response.data);
  },

  // 상품 등록
  createProduct: async (
    productData: Omit<Product, 'id' | 'seller_name' | 'created_at' | 'seller_id'>, 
    userId: number
  ): Promise<FormattedProduct> => {
    const response = await api.post<Product>('/products', {
      ...productData,
      userId
    });
    return productService.formatProduct(response.data);
  },

  // 이미지 업로드
  uploadImages: async (images: FormData): Promise<{ urls: string[] }> => {
    const response = await api.post<{ urls: string[] }>('/upload', images, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
export const chatService = {
  // 채팅방 목록 조회
  getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
    try {
      const response = await api.get(`/chatrooms/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
    }
  },

  // 채팅방 메시지 조회
  getChatMessages: async (roomId: number): Promise<Message[]> => {
    try {
      const response = await api.get(`/chatrooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      throw new Error('메시지를 불러오는데 실패했습니다.');
    }
  },

  // 채팅방 생성
  createChatRoom: async (productId: number, buyerId: number, sellerId: number): Promise<{ id: number }> => {
    try {
      const response = await api.post('/chatrooms', {
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId
      });
      return response.data;
    } catch (error) {
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  // 메시지 전송 (웹소켓 대신 HTTP로 필요한 경우 사용)
  sendMessage: async (chatroomId: number, senderId: number, content: string): Promise<Message> => {
    try {
      const response = await api.post(`/chatrooms/${chatroomId}/messages`, {
        sender_id: senderId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw new Error('메시지 전송에 실패했습니다.');
    }
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