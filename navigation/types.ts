import { Book } from "../services/api";

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
  Product: { item: Product };
};

export type MainTabParamList = {
  Home: undefined;
  SellTab: undefined;  
  Chat: undefined;
  MyPage: undefined;
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
  can_trade: string;
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

export interface FormattedProduct extends Omit<Product, 'images'> {
  imageUrls: string[];
  thumbnailUrl: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends HomeStackParamList {}
  }
}
