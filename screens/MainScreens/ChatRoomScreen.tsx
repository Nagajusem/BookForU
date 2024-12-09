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
  ActivityIndicator,
} from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { ChatRoomStyles as styles } from '../../styles/ChatRoomStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

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
  navigation: any;
}

const ChatRoomScreen = ({ route, navigation }: ChatRoomScreenProps) => {
  const { roomId, productTitle } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket>();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // 소켓 연결 설정
    socketRef.current = io('http://10.0.2.2:3000');
    
    // 채팅방 참여
    socketRef.current.emit('join_room', roomId);
    
    // 이전 메시지 로드
    loadMessages();

    // 새 메시지 수신 리스너
    socketRef.current.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      flatListRef.current?.scrollToEnd();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`/api/chatrooms/${roomId}/messages`);
      setMessages(response.data);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const messageData = {
      chatroom_id: roomId,
      sender_id: user?.id,
      content: newMessage.trim()
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
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

  if (loading) {
    return (
      <View style={Cstyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={Cstyles.container}>
      <View style={Cstyles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{productTitle}</Text>
      </View>
  
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messageList}
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
              style={styles.sendButton} 
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;