import React from 'react';
import { chatScreenStyles as styles } from '../../styles/ChatScreenStyles';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

// 채팅 아이템의 타입 정의
interface ChatItem {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  userImage: string;
}

const DUMMY_CHATS: ChatItem[] = [
  {
    id: '1',
    userName: '홍길동',
    lastMessage: '네 알겠습니다!',
    time: '방금 전',
    unreadCount: 0,
    userImage: '/api/placeholder/50/50',
  },
  {
    id: '2',
    userName: '김철수',
    lastMessage: '내일 거래 가능하신가요?',
    time: '10분 전',
    unreadCount: 2,
    userImage: '/api/placeholder/50/50',
  },
];

const ChatScreen = () => {
  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity style={styles.chatItem}>
      <Image source={{ uri: item.userImage }} style={styles.userImage} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookForU</Text>
      </View>
      <FlatList
        data={DUMMY_CHATS}
        renderItem={renderItem}
        keyExtractor={(item: ChatItem) => item.id}
      />
    </View>
  );
};

export default ChatScreen;