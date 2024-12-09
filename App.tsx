import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthStack from './navigation/AuthStack';
import MainTab from './navigation/MainTab';
import { ActivityIndicator, View } from 'react-native';
import { Image } from 'react-native';

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
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <Image
          source={require('./assets/bookforu.png')}  // 이미지 경로는 실제 저장 위치에 맞게 수정
          style={{
            width: 200,  // 로고 크기는 필요에 따라 조정
            height: 100,
            resizeMode: 'contain'
          }}
        />
      </View>
    );
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