import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../../services/api';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^01[0-9]{8,9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneVerification = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('오류', '올바른 전화번호 형식이 아닙니다.');
      return;
    }

    // 가짜 인증 처리
    setIsVerificationRequested(true);
    setTimeout(() => {
      setIsPhoneVerified(true);
      Alert.alert('성공', '전화번호 인증이 완료되었습니다.');
    }, 1000);
  };

  const handleRegister = async() => {
    // 기본적인 유효성 검사
    if (!username || !password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (!isPhoneVerified) {
      Alert.alert('오류', '전화번호 인증이 필요합니다.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      const response = await authService.register({ username, email, password });
      Alert.alert('성공', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('Login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>회원가입</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                style={styles.input}
                placeholder="아이디를 입력해주세요"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <Text style={styles.label}>전화번호</Text>
              <View style={styles.phoneContainer}>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="'-' 없이 입력해주세요"
                  placeholderTextColor="#666"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="numeric"
                  editable={!isPhoneVerified}
                  maxLength={11}
                />
                <TouchableOpacity 
                  style={[
                    styles.verificationButton,
                    (isPhoneVerified || isVerificationRequested) && styles.disabledButton
                  ]} 
                  onPress={handlePhoneVerification}
                  disabled={isPhoneVerified || isVerificationRequested}
                >
                  <Text style={styles.verificationButtonText}>
                    {isPhoneVerified ? '인증완료' : '인증하기'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력해주세요"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력해주세요"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />

              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력해주세요"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            {isPhoneVerified && (
              <TouchableOpacity 
                style={styles.registerButton} 
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <Text style={styles.registerButtonText}>가입하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 52,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  verificationButton: {
    backgroundColor: '#007AFF',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  registerButton: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;