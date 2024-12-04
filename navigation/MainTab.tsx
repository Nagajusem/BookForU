// MainTab.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/ShopScreens/HomeScreen';
import SellScreen from '../screens/ShopScreens/SellScreen';
import ChatScreen from '../screens/ShopScreens/ChatScreen';
import MyPageScreen from '../screens/ShopScreens/MyPageScreen';
import SearchScreen from '../screens/ShopScreens/SearchScreen';
import ProductScreen from '../screens/ShopScreens/ProductScreen';
import { HomeStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<HomeStackParamList>();

// HomeStack 네비게이터
const HomeStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="HomeMain" component={HomeScreen} 
      />
      <Stack.Screen 
        name="Search" component={SearchScreen} 
      />
      <Stack.Screen
        name="Product" component={ProductScreen} 
      />
    </Stack.Navigator>
  );
};

const MainTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#666666',
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SellScreen}
        options={{
          title: '판매',
          tabBarIcon: ({ color }) => (
            <Icon name="add-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: '채팅',
          tabBarIcon: ({ color }) => (
            <Icon name="chat-bubble-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color }) => (
            <Icon name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTab;