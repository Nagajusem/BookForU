import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 앱 시작시 저장된 사용자 정보 확인
  useEffect(() => {
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        console.log('User is logged in:', parsedUser);
      } else {
        console.log('No saved user found');
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Login attempt with:', { username });
      
      const response = await authService.login({ username, password });
      console.log('Login response:', response);
      
      if (!response || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // 사용자 정보를 AsyncStorage에 저장
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Detailed login error:', error);
      if (error instanceof Error) {
        throw new Error(error.message || '로그인에 실패했습니다.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};