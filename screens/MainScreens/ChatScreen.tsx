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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatNavigatorParamList } from '../../navigation/types';
import { chatService, ChatMessage, ChatRoom } from '../../services/api';

type ChatScreenNavigationProp = NativeStackNavigationProp<ChatNavigatorParamList, 'ChatList'>;

const ChatScreen = () => {
 const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const { user } = useAuth();
 const navigation = useNavigation<ChatScreenNavigationProp>();

 const loadChatRooms = async () => {
   if (!user?.id) {
     setLoading(false);
     return;
   }
   
   try {
     const rooms = await chatService.getChatRooms(user.id);
     setChatRooms(rooms);
   } catch (error) {
     console.error('채팅방 목록 로드 실패:', error);
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
     productTitle: `아이템 ${chatRoom.item_id}` // 임시로 아이템 ID로 표시
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

 const getLastMessage = (chats: ChatMessage[]) => {
   if (chats && chats.length > 0) {
     return chats[chats.length - 1];
   }
   return null;
 };

 const renderItem = ({ item }: { item: ChatRoom }) => {
   const lastMessage = getLastMessage(item.chats);
   const isUser1 = user?.id === item.user1_id;
   const otherUserId = isUser1 ? item.user2_id : item.user1_id;

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
           <Text style={styles.userName}>사용자 {otherUserId}</Text>
           <Text style={styles.chatTime}>
             {lastMessage ? formatTime(lastMessage.send_at) : ''}
           </Text>
         </View>
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