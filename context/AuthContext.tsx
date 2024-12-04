import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import axios from 'axios';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // 앱 시작시 토큰 확인
  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await authService.getToken();
      console.log('Current token:', token); // 토큰 출력
      if (token) {
        setIsLoggedIn(true);
        console.log('User is logged in'); // 로그인 상태 출력
      } else {
        console.log('No token found, user is not logged in'); // 비로그인 상태 출력 
      }
    } catch (error) {
      console.error('Token check failed:', error);
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
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      await authService.setToken(response.token);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Detailed login error:', error);
      // 사용자에게 더 명확한 에러 메시지 전달
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || '서버 연결에 실패했습니다.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.removeToken();
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