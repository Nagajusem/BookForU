import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

 const api = axios.create({
  baseURL: 'http://noum.iptime.org:9000',  // baseURL 확인
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
});


const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '/api/placeholder/150/150';

  const baseUrl = Platform.select({
    android: 'http://noum.iptime.org:9000',
    ios: 'http://noum.iptime.org:9000',
    default: 'http://noum.iptime.org:9000'
  });

  return `${baseUrl}${imagePath}`;
};

// 타입 정의
interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
  category: string;
}

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  is_blocked: boolean;
}

interface Report {
  id: number;
  user_id: number;
  target_id: number;
  report_content: string;
}

interface SignupRequest {
  username: string;  
  password: string;
  email: string;
}

interface SignupResponse {
  detail?: string;
  code: number;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  code: number;
  data?: {
    id: number;
    username: string;
  };
}

export interface Product {
  id: number;
  user_id: number; 
  title: string;
  price: number;
  isbn : number;
  book_condition: string;
  can_trade: string;
  description: string;
  published_date: string;
  completed: boolean;
  images: string[];
}

export interface ChatMessage {
  id: number;
  user_id: number;
  chat_id: number;
  send_at: string;
  content: string;
}

export interface ChatRoom {
  id: number;
  item_id: number;
  user1_id: number;
  user2_id: number;
  chats: ChatMessage[];
}
export interface FormattedProduct extends Omit<Product, 'images'> {
  imageUrls: string[];
  thumbnailUrl: string;
}

export const authService = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<string>('/users/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Server response:', response.data);
      
      if (response.status === 201) {
        return {
          code: 200,  // 성공 코드 추가
          message: response.data,
          data: {
            id: response.data,
            username: credentials.username
          }
        };
      }
      
      throw new Error('로그인 실패');
    } catch (error) {
      console.error('Login API error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        throw new Error(error.response?.data || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },

  // 회원가입 -> 아이디 중복 검증 필요
  register: async (credentials: SignupRequest): Promise<SignupResponse> => {
    try {
      const response = await api.post<SignupResponse>('/users/signup', {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email
      });

      if (response.status === 201) {
        return response.data;
      }

      throw new Error('회원가입 실패');
    } catch (error) {
      console.error('Signup Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          throw new Error(error.response.data.detail || '유효하지 않은 입력입니다.');
        }
        throw new Error(error.response?.data?.detail || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },

  // 회원 탈퇴 -> 지금 안됨
  withdraw: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.delete('/users/user_info', {
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
    const response = await api.get<Product[]>('/items/recent');
    return response.data.map(productService.formatProduct);
  },

  // 상품 상세 조회
  getProduct: async (id: number): Promise<FormattedProduct> => {
    const response = await api.get<Product>(`/items/item_info/${id}`);
    return productService.formatProduct(response.data);
  },

  // 상품 등록
  createProduct: async (
    productData: Omit<Product, 'id' | 'seller_name' | 'published_date' | 'seller_id'>, 
    userId: number
  ): Promise<FormattedProduct> => {
    const response = await api.post<Product>('/items/new_item', {
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
  getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
    try {
      // userId가 number 타입인지 확인
      if (typeof userId !== 'number') {
        console.error('Invalid userId type:', typeof userId);
        return [];
      }
  
      const response = await api.get(`/users/chats?user_id=${userId}`);
      if (response.status === 404) {
        return [];
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
  },

  // 채팅 메시지 목록 조회
  getChatMessages: async (chatId: number): Promise<{
    roomInfo: Omit<ChatRoom, 'chats'>,
    messages: ChatMessage[]
  }> => {
    try {
      const response = await api.get(`/users/chat?chat_id=${chatId}`);
      const { chats, ...roomInfo } = response.data;
      return {
        roomInfo,
        messages: chats
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('메시지를 불러오는데 실패했습니다.');
    }
  },

  // 채팅방 생성
  createChatRoom: async (userId: number, itemId: number): Promise<{ id: number }> => {
    try {
      const response = await api.post('/users/chat/new', {
        user_id: userId,
        item_id: itemId
      });
      return { id: response.data.id };
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw new Error('채팅방 생성에 실패했습니다.');
    }
  },

  // 메시지 전송
  sendMessage: async (userId: number, chatId: number, message: string): Promise<void> => {
    try {
      await api.post('/users/chat/message', {
        user_id: userId,
        chat_id: chatId,
        message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('메시지 전송에 실패했습니다.');
    }
  }
};

export const bookService = {
  searchBooks: async (type: 'title' | 'isbn', query: string): Promise<Book[]> => {
    try {
      if (query.trim().length < 2) {
        return [];
      }
      const trimmedQuery = query.trim().replace(/\s+/g, ' ');
      
      const response = await api.get('/books/book_info', {
        params: { 
          title: trimmedQuery  
        },
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 타임아웃 증가
      });

      if (!response.data) {
        return [];
      }

      return Array.isArray(response.data) ? response.data : [response.data];

    } catch (error) {
      console.error('검색 오류 상세:', error);
      
      if (axios.isAxiosError(error)) {
        // 네트워크 에러
        if (error.message === 'Network Error') {
          throw new Error('서버와의 연결이 원활하지 않습니다.');
        }
        // 500 에러
        if (error.response?.status === 500) {
          throw new Error('서버 내부 오류가 발생했습니다.');
        }
        // 404 에러
        if (error.response?.status === 404) {
          return []; // 검색 결과 없음을 빈 배열로 반환
        }
      }
      throw new Error('도서 검색 중 오류가 발생했습니다.');
    }
  }
};

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 디버깅을 위한 로그
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type {Book, User, Report };
export default api;