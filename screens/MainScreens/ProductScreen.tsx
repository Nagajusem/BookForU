import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList,FormattedProduct } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { ProductScreenStyles as styles } from '../../styles/ProductScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/api';

type ProductScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Product'>;
type ProductScreenRouteProp = RouteProp<HomeStackParamList, 'Product'>;

interface ProductScreenProps {
  navigation: ProductScreenNavigationProp;
  route: ProductScreenRouteProp;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const ProductScreen = ({ navigation, route }: ProductScreenProps) => {
  const { item } = route.params;
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(user?.id === item.seller_id);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleStartChat = async () => {
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }
  
    try {
      const chatRoom = await chatService.createChatRoom(item.id, user.id, item.seller_id);
  
      navigation.navigate('Main', {
        screen: 'Chat',
        params: {
          screen: 'ChatRoom',
          params: {
            roomId: chatRoom.id,
            productTitle: item.title
          }
        }
      } as any); // 임시로 타입 에러를 해결하기 위해 as any 사용
    } catch (error) {
      Alert.alert('오류', '채팅방 생성에 실패했습니다.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '상품 삭제',
      '정말로 이 상품을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 삭제 API 호출 로직 추가 필요
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '상품 삭제에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleComplete = () => {
    Alert.alert(
      '판매 완료',
      '판매가 완료되었습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              // 판매 완료 API 호출 로직 추가 필요
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '상태 변경에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={Cstyles.container}>
      <View style={Cstyles.header}>
        <TouchableOpacity
          style={Cstyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={[styles.imageContainer, { height: SCREEN_WIDTH }]}
        >
          {item.imageUrls.map((url, index) => (
            <View key={index} style={{ width: SCREEN_WIDTH }}>
              <Image
                source={{ uri: url }}
                style={{
                  width: SCREEN_WIDTH,
                  height: SCREEN_WIDTH,
                  resizeMode: 'cover'
                }}
              />
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <Text style={styles.time}>{item.created_at}</Text>
        
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>판매자</Text>
            <Text style={styles.sellerName}>{item.seller_name}</Text>
          </View>

          <View style={Cstyles.divider} />

          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>상태</Text>
            <Text style={styles.sellerName}>{item.status}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>직거래 여부</Text>
            <Text style={styles.sellerName}>{item.handonhand}</Text>
          </View>
          <View style={Cstyles.divider} />

          <View style={styles.description}>
            <Text style={styles.descriptionTitle}>상품 정보</Text>
            <Text style={styles.descriptionText}>
              {item.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isSeller ? (
          <View style={styles.sellerButtonContainer}>
            <TouchableOpacity 
              style={[styles.sellerButton, styles.deleteButton]} 
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sellerButton, styles.completeButton]} 
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>판매완료</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.chatButton} 
            onPress={handleStartChat}
          >
            <Text style={styles.chatButtonText}>채팅하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};


export default ProductScreen;