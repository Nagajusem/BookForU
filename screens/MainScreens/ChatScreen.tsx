import React, { useEffect, useState } from 'react';
import { chatScreenStyles as styles } from '../../styles/ChatScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
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
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatNavigatorParamList } from '../../navigation/types';

interface ChatRoom {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  product_title: string;
  product_price: number;
  buyer_name: string;
  seller_name: string;
  last_message?: {
    content: string;
    created_at: string;
  };
}

type ChatScreenNavigationProp = NativeStackNavigationProp<ChatNavigatorParamList, 'ChatList'>;

const ChatScreen = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<ChatScreenNavigationProp>();

  const loadChatRooms = async () => {
    if (!user) return;

    try {
      const response = await axios.get(`http://10.0.2.2:3000/api/chatrooms/user/${user.id}`);
      setChatRooms(response.data);
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

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      roomId: chatRoom.id,
      productTitle: chatRoom.product_title
    });
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  const renderItem = ({ item }: { item: ChatRoom }) => {
    const otherUser = user?.id === item.buyer_id ? item.seller_name : item.buyer_name;

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
            <Text style={styles.userName}>{otherUser}</Text>
            <Text style={styles.chatTime}>
              {item.last_message ? formatTime(item.last_message.created_at) : formatTime(item.created_at)}
            </Text>
          </View>
          <View style={styles.chatFooter}>
            <Text style={styles.productTitle} numberOfLines={1}>
              {item.product_title}
            </Text>
            <Text style={styles.productPrice}>
              {item.product_price.toLocaleString()}원
            </Text>
          </View>
          {item.last_message && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message.content}
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
        <Image
          source={require('../../assets/bookforu.png')} 
          style={{
            width: 120,
            height: 40,
            resizeMode: 'contain'
          }}
        />
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