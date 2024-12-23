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
import { useAuth } from '../../context/AuthContext';
import { ChatRoomStyles as styles } from '../../styles/ChatRoomStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { chatService } from '../../services/api';

interface ChatMessage {
  id: number;
  user_id: number;
  chat_id: number;
  said_at: string;
  content: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // 메시지 목록 로드
  const loadMessages = async () => {
    try {
      const { messages: newMessages } = await chatService.getChatMessages(roomId);
      setMessages(newMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await chatService.sendMessage(user.id, roomId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.user_id === user?.id;

    return (
      <View style={[
        styles.messageContainer,
        isMine ? styles.myMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMine ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.said_at).toLocaleTimeString('ko-KR', {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {productTitle}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        </View>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;