import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

// const BASE_URL = 'http://10.0.2.2:3000/api'; 
const BASE_URL = 'http://noum.iptime.org:9000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return '/api/placeholder/150/150';
  
  // const baseUrl = Platform.select({
  //   android: 'http://10.0.2.2:3000', 
  //   ios: 'http://localhost:3000', 
  //   default: 'http://localhost:3000' 
  // });

  const baseUrl = Platform.select({
    android: 'http://noum.iptime.org:9000',
    ios: 'http://noum.iptime.org:9000',
    default: 'http://noum.iptime.org:9000'
  });

  return `${baseUrl}${imagePath}`;
};

// 응답 타입 정의 업데이트
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    id: number;
    username: string;
  };
  code: number;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  code: number;
  data: {
    id: number;
    username: string;
    email: string;
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

export interface SocketMessage {
  chatroom_id: number;
  sender_id: number;
  content: string;
}

class ChatSocketService {
  private static instance: ChatSocketService;
  private socket: Socket | null = null;
  private messageHandlers: Map<number, (message: Message) => void> = new Map();

  private constructor() {}

  static getInstance(): ChatSocketService {
    if (!ChatSocketService.instance) {
      ChatSocketService.instance = new ChatSocketService();
    }
    return ChatSocketService.instance;
  }

  connect() {
    if (!this.socket) {
      console.log('Attempting socket connection...');
      // this.socket = io('http://10.0.2.2:3000');
      this.socket = io('http://noum.iptime.org:9000');

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      this.socket.on('message', (message: Message) => {
        console.log('Received new message:', message);
        const handler = this.messageHandlers.get(message.chatroom_id);
        if (handler) {
          handler(message);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: number) {
    if (this.socket) {
      console.log(`Joining room: ${roomId}`);
      this.socket.emit('join', roomId);
    }
  }

  sendMessage(messageData: SocketMessage) {
    if (this.socket?.connected) {
      console.log('Sending message:', messageData);
      this.socket.emit('send_message', messageData);
    } else {
      console.error('Socket not connected');
      this.connect();
    }
  }

  subscribeToMessages(roomId: number, callback: (message: Message) => void) {
    this.messageHandlers.set(roomId, callback);
  }

  unsubscribeFromMessages(roomId: number) {
    this.messageHandlers.delete(roomId);
  }
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/users/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      // 응답 구조 확인 및 데이터 반환
      if (response.data && response.data.code === 200) {
        return response.data;
      }
      
      throw new Error('로그인 실패');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다');
      }
      throw error;
    }
  },
  
  register: async (credentials: SignupCredentials): Promise<SignupResponse> => {
    try {
      console.log('Signup Request:', credentials);
      
      const response = await api.post('/users/signup', {
        username: credentials.username,
        password: credentials.password,
        email: credentials.email
      });
      
      console.log('Full Response:', response); // 전체 응답 로그 확인
      
      if (response.data) {
        return response.data;
      }
      
      throw new Error('회원가입 실패');
    } catch (error) {
      console.error('Signup Error Details:', error);
      if (axios.isAxiosError(error)) {
        console.log('Error Response:', error.response?.data);
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
  // HTTP 요청 관련 메서드
  getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
    try {
      const response = await api.get(`/chatrooms/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
    }
  },

  getChatMessages: async (roomId: number): Promise<Message[]> => {
    try {
      const response = await api.get(`/chatrooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw new Error('메시지를 불러오는데 실패했습니다.');
    }
  },

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

  // 웹소켓 관련 메서드
  socketInstance: ChatSocketService.getInstance(),

  initializeSocket() {
    return this.socketInstance.connect();
  },

  disconnectSocket() {
    this.socketInstance.disconnect();
  },

  joinChatRoom(roomId: number) {
    this.socketInstance.joinRoom(roomId);
  },

  sendMessage(messageData: SocketMessage) {
    this.socketInstance.sendMessage(messageData);
  },

  subscribeToMessages(roomId: number, callback: (message: Message) => void) {
    this.socketInstance.subscribeToMessages(roomId, callback);
  },

  unsubscribeFromMessages(roomId: number) {
    this.socketInstance.unsubscribeFromMessages(roomId);
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