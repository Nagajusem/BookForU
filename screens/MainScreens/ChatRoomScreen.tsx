import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { ChatRoomStyles as styles } from '../../styles/ChatRoomStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatNavigatorParamList } from '../../navigation/types';

interface Message {
  id: number;
  content: string;
  sender_id: number;
  sender_name: string;
  created_at: string;
  chatroom_id: number;
}

interface ChatRoomScreenProps {
  route: {
    params: {
      roomId: number;
      productTitle: string;
    };
  };
  navigation: NativeStackNavigationProp<ChatNavigatorParamList, 'ChatRoom'>;
}

const ChatRoomScreen = ({ route, navigation }: ChatRoomScreenProps) => {
  const { roomId, productTitle } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket>();
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // 소켓 연결 시도 로그
    console.log('Attempting socket connection...');
    
    socketRef.current = io('http://10.0.2.2:3000');
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully');
      socketRef.current?.emit('join', roomId);
    });
    
    // 이전 메시지 로드 확인
    socketRef.current.on('load_messages', (loadedMessages: Message[]) => {
      console.log('Loaded messages:', loadedMessages);
      setMessages(loadedMessages);
      if (loadedMessages.length > 0) {
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    });

    // 새 메시지 수신 확인
    socketRef.current.on('message', (message: Message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      console.log('Cleaning up socket connection');
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
  
    console.log('Sending message:', {
      chatroom_id: roomId,
      sender_id: user?.id,
      content: newMessage.trim()
    });
  
    // 메시지 전송 전에 유효성 검사
    if (!user?.id || !roomId) {
      console.error('Missing user ID or room ID');
      return;
    }
  
    const messageData = {
      chatroom_id: roomId,
      sender_id: user.id,
      content: newMessage.trim()
    };
  
    // 소켓 연결 상태 확인
    if (!socketRef.current.connected) {
      console.error('Socket not connected. Attempting to reconnect...');
      socketRef.current.connect();
      return;
    }
  
    socketRef.current.emit('send_message', messageData);
  
    // Optimistic update (바로 UI에 반영)
    const optimisticMessage = {
      id: Date.now(), // 임시 ID
      content: newMessage.trim(),
      sender_id: user.id,
      sender_name: user.username,
      chatroom_id: roomId,
      created_at: new Date().toISOString()
    };
  
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    flatListRef.current?.scrollToEnd();
  
    // 에러 핸들링
    socketRef.current.once('error', (error) => {
      console.error('Failed to send message:', error);
      // 에러 발생 시 메시지 롤백
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === user?.id;

    return (
      <View style={[
        styles.messageContainer,
        isMine ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMine && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <Text style={[
          styles.messageText,
          isMine ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{productTitle}</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="메시지를 입력하세요..."
            multiline
          />
          <TouchableOpacity 
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Icon 
              name="send" 
              size={24} 
              color={newMessage.trim() ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;