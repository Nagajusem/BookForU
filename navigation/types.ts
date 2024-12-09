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
  Sell: undefined;
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

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  handonhand: string;
  description: string;
  seller_name: string;
  seller_id: number; 
  created_at: string;
  images: string[];
}

export type HomeStackParamList = {
  HomeMain: undefined;
  Search: undefined;
  Product: {
    item: Product;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends HomeStackParamList {}
  }
}
