export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Sell: undefined;
  Chat: undefined;
  MyPage: undefined;
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
  created_at: string;
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
