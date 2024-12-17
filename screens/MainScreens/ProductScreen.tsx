import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList,ReportReason,RootStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { ProductScreenStyles as styles } from '../../styles/ProductScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import { useAuth } from '../../context/AuthContext';
import api, { chatService, productService, User, userService } from '../../services/api';
import { CompositeNavigationProp } from '@react-navigation/native';

type ProductScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Product'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProductScreenProps {
  navigation: ProductScreenNavigationProp;
  route: RouteProp<HomeStackParamList, 'Product'>;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const REPORT_REASONS: ReportReason[] = [
  { id: 1, label: '허위 매물', value: '허위 매물' },
  { id: 2, label: '부적절한 내용', value: '부적절한 내용' },
  { id: 3, label: '사기 의심', value: '사기 의심' },
  { id: 4, label: '기타', value: '기타'}
];

const ReportModal = ({ 
  visible, 
  onClose, 
  onSubmit 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (reason: string) => void;
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>신고 사유 선택</Text>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={styles.reasonButton}
              onPress={() => onSubmit(reason.value)}
            >
              <Text style={styles.reasonText}>{reason.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ProductScreen = ({ navigation, route }: ProductScreenProps) => {
  const { item } = route.params;
  const { user } = useAuth();
  const [isSeller, setIsSeller] = useState(user?.id === item.user_id);
  const [sellerInfo, setSellerInfo] = useState<User | null>(null);
  const [isCompleted, setIsCompleted] = useState(item.completed);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const seller = await userService.getUserById(item.user_id);
        setSellerInfo(seller);
      } catch (error) {
        console.error('판매자 정보 로드 실패:', error);
      }
    };

    fetchSellerInfo();
  }, [item.user_id]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleStartChat = async () => {
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }
  
    try {
      console.log('Starting chat with:', {
        buyerId: user.id,
        itemId: item.id,
        sellerId: item.user_id
      });
      
      const chatRoom = await chatService.createChatRoom(user.id, item.id);
      
      if (!chatRoom || !chatRoom.id) {
        throw new Error('채팅방 생성 응답이 올바르지 않습니다.');
      }
  
      const bookTitle = item.bookInfo?.title || item.title;
      console.log('Book title for chat:', bookTitle); // 디버깅용
  
      navigation.navigate('Main', {
        screen: 'Chat',
        params: {
          screen: 'ChatRoom',
          params: {
            roomId: chatRoom.id,
            productTitle: bookTitle 
          }
        }
      } as const);
  
    } catch (error) {
      console.error('Chat creation error:', error);
      Alert.alert(
        '오류', 
        error instanceof Error ? error.message : '채팅방 생성에 실패했습니다.'
      );
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
              await productService.deleteProduct(item.id);
              Alert.alert('성공', '상품이 삭제되었습니다.', [
                {
                  text: '확인',
                  onPress: () => navigation.goBack()
                }
              ]);
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
              await productService.completeProduct(item.id);
              setIsCompleted(true);
              Alert.alert('성공', '판매가 완료되었습니다.');
            } catch (error) {
              Alert.alert('오류', '상태 변경에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleReport = async (reason: string) => {
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }
  
    if (!sellerInfo) {
      Alert.alert('오류', '판매자 정보를 불러올 수 없습니다.');
      return;
    }
  
    try {
      await api.post('/users/report', {
        id: 0,
        user_id: user.id,          // 신고자 ID
        target_id: sellerInfo.id,  // 피신고자(판매자) ID로 수정
        report_content: reason
      });
      
      Alert.alert('알림', '신고가 접수되었습니다.');
      setIsReportModalVisible(false);
    } catch (error) {
      console.error('신고 실패:', error);
      Alert.alert('오류', '신고 처리 중 문제가 발생했습니다.');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }

    try {
      // await wishlistService.addToWishlist(user.id);
      setIsWishlisted(true);
      Alert.alert('알림', '찜 목록에 추가되었습니다.');
    } catch (error) {
      console.error('찜하기 실패:', error);
      Alert.alert('오류', '찜하기에 실패했습니다.');
    }
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {!isSeller && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setIsReportModalVisible(true)}
          >
            <Icon name="report" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={handleReport}
      />
      <ScrollView>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={[styles.imageContainer, { height: SCREEN_WIDTH }]}
        >
          <View style={{ width: SCREEN_WIDTH }}>
            <Image
              source={{ 
                uri: `http://noum.iptime.org:9000/books/thumbnail?isbn=${item.isbn}`,
                headers: {
                  Accept: 'image/jpeg, image/png, image/jpg, application/json'
                }
              }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH,
                resizeMode: 'contain'
              }}
              onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent.error)}
            />
          </View>
        </ScrollView>
        
        <View style={styles.contentContainer}>
          {/* 책 제목 - 가장 상단에 표시 */}
          <Text style={styles.bookTitle}>
            {item.bookInfo?.title || item.title}
          </Text>

          {/* 가격 */}
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          <Text style={styles.time}>{item.published_date}</Text>

          {/* 판매자 정보 섹션 */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>판매자</Text>
            <Text style={styles.sellerName}>
              {sellerInfo ? sellerInfo.username : '로딩중...'}
            </Text>
          </View>

          <View style={Cstyles.divider} />

          {/* 책 상태 */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>상태</Text>
            <Text style={styles.sellerName}>{item.book_condition}</Text>
          </View>

          {/* 직거래 여부 */}
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>직거래 여부</Text>
            <Text style={styles.sellerName}>
              {item.can_trade === true ? '가능' : '불가능'}
            </Text>
          </View>

          <View style={Cstyles.divider} />

          {/* 상품 정보 */}
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
          item.completed ? (
            <View style={styles.completedContainer}>
              <View style={styles.completedButton}>
                <Text style={styles.completedButtonText}>판매 완료</Text>
              </View>
            </View>
          ) : (
            <View style={styles.buyerButtonContainer}>
              <TouchableOpacity 
                style={styles.chatButton} 
                onPress={handleStartChat}
              >
                <Text style={styles.chatButtonText}>채팅하기</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.wishlistButton} 
                onPress={handleWishlist}
              >
                <Icon 
                  name={isWishlisted ? "favorite" : "favorite-border"} 
                  size={24} 
                  color="#FF6B6B" 
                />
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
};


export default ProductScreen;