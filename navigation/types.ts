import { FormattedProduct } from '../services/api';

export type RootStackParamList = {
  Auth: undefined;
  Main: {
    screen: string;
    params?: {
      screen: string;
      params: {
        roomId: number;
        productTitle: string;
      };
    };
  };
  HomeMain: undefined;
  Search: undefined;
  Product: { item: FormattedProduct };
};

export type MainTabParamList = {
  Home: undefined;
  Sell: { bookInfo?: Book } | undefined; 
  Chat: {
    screen: string;
    params: {
      roomId: number;
      productTitle: string;
    };
  };
  MyPage: undefined;
};

export type MyPageStackParamList = {
  MyPageMain: undefined;
  Notice: undefined;
  Settings: undefined;
  Support: undefined;
};

export type ChatNavigatorParamList = {
  ChatList: undefined;
  ChatRoom: {
    roomId: number;
    productTitle: string;
  };
};

export type SellStackParamList = {
  BookSearch: undefined;
  Sell: { bookInfo: Book };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export interface Product {
  id: number;
  user_id: number; 
  title: string;
  price: number;
  isbn : number;
  book_condition: string;
  can_trade: boolean;
  description: string;
  published_date: string;
  images: string[];
}

export type HomeStackParamList = {
  HomeMain: undefined;
  Search: undefined;
  Product: {
    item: FormattedProduct;
  };
};

export interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
  category: string;
  image_url?: string;
}

export interface ReportReason {
  id: number;
  label: string;
  value: string;
}

export interface CreateProductRequest {
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
declare global {
  namespace ReactNavigation {
    interface RootParamList extends HomeStackParamList {}
  }
}

export type { FormattedProduct };

