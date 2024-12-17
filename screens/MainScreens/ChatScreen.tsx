// ChatScreen.tsx
import React, { useEffect, useState } from 'react';
import { chatScreenStyles as styles } from '../../styles/ChatScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatNavigatorParamList } from '../../navigation/types';
import { chatService, userService, productService, User } from '../../services/api';

interface ChatRoom {
  id: number;
  item_id: number;
  user1_id: number;
  user2_id: number;
  chats: Array<{
    id: number;
    user_id: number;
    content: string;
    said_at: string;
  }>;
}

interface EnhancedChatRoom extends ChatRoom {
  otherUser?: User;
  productTitle?: string;
}

type ChatScreenNavigationProp = NativeStackNavigationProp<ChatNavigatorParamList, 'ChatList'>;

const ChatScreen = () => {
  const [chatRooms, setChatRooms] = useState<EnhancedChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<ChatScreenNavigationProp>();

  const loadChatRooms = async () => {
    if (!user) return;
  
    try {
      const rooms = await chatService.getChatRooms(user.id);
      
      // 각 채팅방에 대해 추가 정보를 로드
      const enhancedRooms = await Promise.all(rooms.map(async (room) => {
        try {
          // 상대방 ID 결정
          const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;
          const otherUser = await userService.getUserById(otherUserId);
          
          // 제품 정보 가져오기 (제품 조회 API가 있다고 가정)
          const product = await productService.formatProduct({
            id: room.item_id,
            user_id: otherUserId,
            // 필수 필드들을 채워줍니다
            title: '',
            price: 0,
            isbn: '',
            book_condition: '',
            can_trade: true,
            description: '',
            published_date: '',
            completed: false,
            images: []
          });

          return {
            ...room,
            otherUser,
            productTitle: product.title,
          };
        } catch (error) {
          console.error('Error loading additional info:', error);
          return room;
        }
      }));

      setChatRooms(enhancedRooms);
    } catch (error) {
      console.error('채팅방 목록 로드 실패:', error);
      Alert.alert('오류', '채팅방 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChatRooms();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadChatRooms();
  };

  const handleChatRoomPress = (chatRoom: EnhancedChatRoom) => {
    navigation.navigate('ChatRoom', {
      roomId: chatRoom.id,
      productTitle: chatRoom.productTitle || '채팅방'
    });
  };

  const renderItem = ({ item }: { item: EnhancedChatRoom }) => {
    const lastMessage = item.chats[item.chats.length - 1];
    const formattedTime = lastMessage 
      ? new Date(lastMessage.said_at).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';

    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => handleChatRoomPress(item)}
      >
        <Image 
          source={{ uri: '/api/placeholder/50/50' }} 
          style={styles.userImage}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>
              {item.otherUser?.username || `User ${item.user1_id === user?.id ? item.user2_id : item.user1_id}`}
            </Text>
            <Text style={styles.chatTime}>{formattedTime}</Text>
          </View>
          {item.productTitle && (
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.productTitle}
            </Text>
          )}
          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.content}
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
    <View style={Cstyles.container}>
      <View style={Cstyles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={Cstyles.emptyContainer}>
            <Text style={styles.emptyText}>채팅방이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
};

export default ChatScreen;