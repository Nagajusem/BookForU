import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../screens/MainScreens/ChatScreen';
import ChatRoomScreen from '../screens/MainScreens/ChatRoomScreen';
import { ChatNavigatorParamList } from './types';

const Stack = createNativeStackNavigator<ChatNavigatorParamList>();

const ChatNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
};

export default ChatNavigator;