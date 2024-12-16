
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/MainScreens/HomeScreen';
import BookSearchScreen from '../screens/MainScreens/BookSearchScreen';
import SellScreen from '../screens/MainScreens/SellScreen';
import MyPageScreen from '../screens/MainScreens/MyPageScreen';
import SearchScreen from '../screens/MainScreens/SearchScreen';
import ProductScreen from '../screens/MainScreens/ProductScreen';
import ChatNavigator from './ChatNavigator';
import { HomeStackParamList, MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator();


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

const SellStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookSearch" component={BookSearchScreen} />
      <Stack.Screen name="Sell" component={SellScreen} />
    </Stack.Navigator>
  );
};

const MainTab = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0b6799',
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
        name="SellTab"  // 탭 이름 변경
        component={SellStack}  // SellStack을 컴포넌트로 사용
        options={{
          title: '판매',
          tabBarIcon: ({ color }) => (
            <Icon name="add-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
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