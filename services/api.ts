import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';

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
  isbn : string;
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
    is_blocked: boolean;
  };
}

interface CreateProductData {
  id?: number;           // 서버가 요구하는 id 필드 추가
  user_id: number;
  title: string;
  price: number;
  isbn: string;
  book_condition: string;
  can_trade: boolean;
  description: string;
  completed: boolean;
  published_date: string;
}

export interface Product {
  id: number;
  user_id: number; 
  title: string;
  price: number;
  isbn : string;
  book_condition: string;
  can_trade: boolean;
  description: string;
  published_date: string;
  completed: boolean;
  images: string[];
}

export interface ChatMessage {
  id: number;
  user_id: number;
  chat_id: number;
  said_at: string;
  content: string;
}

export interface ChatRoom {
  id: number;
  item_id: number;
  user1_id: number;
  user2_id: number;
  chats: ChatMessage[];
  item_title: string;
  user1_name: string; 
  user2_name: string;
}

interface BookInfo {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
  category: string;
  thumbnail?: string;
}

export interface FormattedProduct extends Product {
  bookInfo?: BookInfo;
}

export const authService = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<number | string>('/users/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('Server response:', response.data);
      
      if (response.status === 201) {
        // response.data에서 직접 ID 추출
        const userId = typeof response.data === 'object' ? response.data.id : response.data;
        
        // 사용자 정보 조회 시 user_id를 직접 값으로 전달
        const userInfoResponse = await api.get('/users/user_info', {
          params: { user_id: userId }
        });

        const userInfo = userInfoResponse.data;
        console.log('User info:', userInfo);
        
        // 차단된 사용자 체크
        if (userInfo.is_blocked) {
          throw new Error('BLOCKED_USER');
        }
  
        return {
          code: 200,
          data: {
            id: userId,
            username: credentials.username,
            is_blocked: userInfo.is_blocked
          }
        };
      }
      
      throw new Error('로그인 실패');
    } catch (error) {
      console.error('Login API error:', error);
      
      // 차단된 사용자 에러 처리
      if (error instanceof Error) {
        if (error.message === 'BLOCKED_USER') {
          throw new Error('차단된 회원입니다. 관리자에게 문의하세요.');
        }
      }
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          const errorMessage = error.response.data?.detail || '아이디 또는 비밀번호가 올바르지 않습니다.';
          throw new Error(errorMessage);
        }
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다');
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

  withdraw: async (userId: number) => {
    try {
      const response = await api.delete('/users/user_info', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || '회원탈퇴에 실패했습니다.');
      }
      throw error;
    }
  }
};

export const productService = {
  formatProduct: async (product: Product): Promise<FormattedProduct> => {
    try {
      let bookInfo: BookInfo | undefined;

      try {
        const bookResponse = await api.get(`/books/book_info/isbn`, {
          params: { isbn: product.isbn }
        });
        
        const thumbnailResponse = await api.get(`/books/thumbnail`, {
          params: { isbn: product.isbn }
        });
        console.log('썸네일 응답:', thumbnailResponse.data);
        if (bookResponse.data) {
          bookInfo = {
            ...bookResponse.data,
            thumbnail: thumbnailResponse.data
          };
        }
      } catch (error) {
        console.warn('책 정보 또는 썸네일 조회 실패:', product.isbn);
      }

      return {
        ...product,
        bookInfo
      };
    } catch (error) {
      console.error('상품 정보 포맷 실패:', error);
      return {
        ...product,
        bookInfo: undefined
      };
    }
  },

  getProducts: async (): Promise<FormattedProduct[]> => {
    try {
      const response = await api.get<Product[]>('/items/recent');
      console.log('서버 응답:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('올바르지 않은 데이터 형식');
      }

      // 각 상품의 포맷 실패시에도 전체 목록은 표시
      const formattedProducts = await Promise.all(
        response.data.map(async (product) => {
          try {
            return await productService.formatProduct(product);
          } catch (error) {
            console.error(`상품 포맷 실패 (ID: ${product.id}):`, error);
            // 기본 정보로 표시
            return {
              ...product,
              title: product.title,
              thumbnailUrl: '/api/placeholder/150/150',
              imageUrls: []
            };
          }
        })
      );
      
      return formattedProducts;
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw error;
    }
  },

  getProductById: async (productId: number): Promise<Product> => {
    try {
      const response = await api.get(`/items/item?item_id=${productId}`);
      return response.data;
    } catch (error) {
      console.error('상품 정보 조회 실패:', error);
      throw error;
    }
  },

  // 상품 등록
  createProduct: async (productData: CreateProductData): Promise<any> => {
    try {
      console.log('API 요청 데이터:', productData);
      
      // id 필드 추가
      const requestData = {
        id: 0, // 새로운 상품이므로 0 또는 null로 설정
        ...productData,
      };
  
      console.log('최종 요청 데이터:', requestData);
      const response = await api.post('/items/new_item', requestData);
      
      console.log('API 응답:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API 에러 응답 상세:', {
        status: error.response?.status,
        data: error.response?.data,
        detail: error.response?.data?.detail
      });
      
      if (error.response?.data?.detail) {
        console.error('Validation errors:', 
          JSON.stringify(error.response.data.detail, null, 2)
        );
      }
      
      throw error;
    }
  },

  deleteProduct: async (itemId: number): Promise<void> => {
    try {
      await api.delete('/items/item_info', {
        params: { item_id: itemId }
      });
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw new Error('상품을 삭제하는데 실패했습니다.');
    }
  },
  
  completeProduct: async (itemId: number): Promise<void> => {
    try {
      await api.put('/items/item_info', null, {
        params: { 
          item_id: itemId,
          completed: true
        }
      });
    } catch (error) {
      console.error('상품 상태 변경 실패:', error);
      throw new Error('상품 상태를 변경하는데 실패했습니다.');
    }
  }
};

export const chatService = {
  // 채팅방 목록 조회
  getChatRooms: async (userId: number): Promise<ChatRoom[]> => {
    try {
      const response = await api.get(`/users/chat_ids?user_id=${userId}`);
      const chatIds = response.data;
      
      // 각 채팅방의 상세 정보를 가져옴
      const chatRooms = await Promise.all(
        chatIds.map(async (chatId: number) => {
          const chatResponse = await api.get(`/users/chat?chat_id=${chatId}`);
          return chatResponse.data;
        })
      );
      
      return chatRooms;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
  },

  // 특정 채팅방의 메시지 목록 조회
  getChatMessages: async (chatId: number): Promise<{
    roomInfo: ChatRoom,
    messages: ChatMessage[]
  }> => {
    try {
      const response = await api.get(`/users/chat?chat_id=${chatId}`);
      const { chats, ...roomInfo } = response.data;
      return {
        roomInfo,
        messages: chats || []
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('메시지를 불러오는데 실패했습니다.');
    }
  },

  createChatRoom: async (userId: number, itemId: number): Promise<{ id: number }> => {
    try {
      // 먼저 기존 채팅방이 있는지 확인
      const existingRooms = await chatService.getChatRooms(userId);
      const existingRoom = existingRooms.find(room => room.item_id === itemId);
      
      if (existingRoom) {
        return { id: existingRoom.id };
      }

      // 기존 채팅방이 없으면 새로 생성
      const response = await api.post('/users/chat/new', null, {
        params: {
          user_id: userId,
          item_id: itemId
        }
      });
      
      return { id: response.data.id };
    } catch (error: any) {
      console.error('Chat room creation error:', error.response?.data);
      throw new Error(error.response?.data?.detail?.[0]?.msg || '채팅방 생성에 실패했습니다.');
    }
  },

  // 메시지 전송 메서드
  sendMessage: async (userId: number, chatId: number, message: string): Promise<void> => {
    try {
      // params로 데이터 전달
      await api.post('/users/chat/message', null, {
        params: {
          user_id: userId,
          chat_id: chatId,
          message: message
        }
      });
    } catch (error: any) {
      console.error('Message sending error:', error.response?.data);
      throw new Error(error.response?.data?.detail?.[0]?.msg || '메시지 전송에 실패했습니다.');
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
      
      let response;
      if (type === 'isbn') {
        // ISBN 검색용 엔드포인트
        response = await api.get(`/books/book_info/isbn`, {
          params: { isbn: trimmedQuery }
        });
      } else {
        // 제목 검색용 엔드포인트
        response = await api.get('/books/book_info', {
          params: { title: trimmedQuery }
        });
      }

      console.log(`${type} 검색 응답:`, response.data);

      if (!response.data) {
        return [];
      }

      // ISBN 검색은 단일 객체를, 제목 검색은 배열을 반환할 수 있음
      return Array.isArray(response.data) ? response.data : [response.data];

    } catch (error) {
      console.error(`${type} 검색 오류:`, error);
      
      if (axios.isAxiosError(error)) {
        if (error.message === 'Network Error') {
          throw new Error('서버와의 연결이 원활하지 않습니다.');
        }
        if (error.response?.status === 500) {
          throw new Error('서버 내부 오류가 발생했습니다.');
        }
        if (error.response?.status === 404) {
          return [];
        }
      }
      throw new Error('도서 검색 중 오류가 발생했습니다.');
    }
  },

  getBookByIsbn: async (isbn: string): Promise<Book | null> => {
    try {
      console.log('ISBN으로 책 정보 요청:', isbn);
      const response = await api.get('/books/book_info', {
        params: { isbn }
      });
      return response.data;
    } catch (error) {
      console.error('책 정보 조회 실패:', error);
      return null;
    }
  },

  getBookThumbnail: async (isbn: string): Promise<string> => {
    try {
      const baseUrl = Platform.select({
        android: 'http://noum.iptime.org:9000',
        ios: 'http://noum.iptime.org:9000',
        default: 'http://noum.iptime.org:9000'
      });
      
      // 이미지 URL 직접 반환
      return `${baseUrl}/books/thumbnail?isbn=${isbn}`;
    } catch (error) {
      console.error('썸네일 조회 실패:', error);
      return '/api/placeholder/150/150';
    }
  }
}

export const userService = {
  getUserById: async (userId: number): Promise<User> => {
    try {
      // 숫자 값으로 직접 전달
      const response = await api.get('/users/user_info', {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      throw error;
    }
  }
};

export const reportService = {
  reportItem: async (userId: number, targetId: number, reason: string) => {
    try {
      const response = await api.post('/users/report', {
        id: 0,
        user_id: userId,
        target_id: targetId,
        report_content: reason
      });
      return response.data;
    } catch (error) {
      console.error('신고 실패:', error);
      throw error;
    }
  },
};

export const wishlistService = {
  addToWishlist: async (userId: number): Promise<void> => {
    try {
      await api.post(`/users/wishlist?user_id=${userId}`);
    } catch (error) {
      console.error('위시리스트 추가 실패:', error);
      throw error;
    }
  },
  
  getWishlist: async (userId: number): Promise<Product[]> => {
    try {
      const response = await api.get(`/users/wishlist?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('위시리스트 조회 실패:', error);
      throw error;
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