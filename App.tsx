import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthStack from './navigation/AuthStack';
import MainTab from './navigation/MainTab';
import { ActivityIndicator } from 'react-native';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

// AppContent.tsx 컴포넌트를 새로 생성
const AppContent = () => {
  const Stack = createNativeStackNavigator();
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator style={{flex: 1}} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainTab} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;