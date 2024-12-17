// screens/MyPageScreen.tsx
import React from 'react';
import { myPageScreenStyles as styles } from '../../styles/MyPageScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { authService, wishlistService } from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MyPageStackParamList } from '../../navigation/types';

type MyPageScreenNavigationProp = NativeStackNavigationProp<MyPageStackParamList, 'MyPageMain'>;

interface MyPageScreenProps {
  navigation: MyPageScreenNavigationProp;
}

const MyPageScreen = ({ navigation }: MyPageScreenProps) => {
  const { logout, user } = useAuth();
  console.log('Current user in MyPage:', user); // 디버깅용 로그
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원탈퇴',
      '정말로 탈퇴하시겠습니까?\n탈퇴 후에는 복구가 불가능합니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user) {
                Alert.alert('오류', '사용자 정보를 찾을 수 없습니다.');
                return;
              }
              await authService.withdraw(user.id);
              await logout();
            } catch (error) {
              console.error('회원탈퇴 중 에러:', error);
              Alert.alert(
                '오류',
                error instanceof Error ? error.message : '회원탈퇴 중 오류가 발생했습니다.'
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleWishlistPress = async () => {
    try {
      if (!user) {
        Alert.alert('알림', '로그인이 필요한 서비스입니다.');
        return;
      }
      
      const wishlist = await wishlistService.getWishlist(user.id);
      // 찜 목록 화면으로 이동
      // navigation.navigate('WishList', { wishlist });
    } catch (error) {
      console.error('찜 목록 조회 실패:', error);
      Alert.alert('오류', '찜 목록을 불러오는데 실패했습니다.');
    }
  };

  return (
    <ScrollView style={Cstyles.container}>
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
      <View style={styles.profileSection}>
        <Image
          source={{ uri: '/api/placeholder/100/100' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {/* 나중에 닉네임 설정하면 id가 아닌 닉네임이 나오도록 사용자 이름쪽 변경 */}
            {user?.username || '사용자 이름'} 
          </Text>
          <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>닉네임 수정</Text>
      </TouchableOpacity>
    </View>
      </View>

      <View style={styles.statsSection}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>판매내역</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>구매내역</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={handleWishlistPress}
        >
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>찜</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings" size={24} color="#666" />
          <Text style={styles.menuText}>설정</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notice')}>
          <Icon name="info-outline" size={24} color="#666" />
          <Text style={styles.menuText}>공지사항</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="live-help" size={24} color="#666" />
          <Text style={styles.menuText}>고객센터</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#666" />
          <Text style={styles.menuText}>로그아웃</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleWithdraw}>
          <Icon name="delete" size={24} color="#666" />
          <Text style={styles.menuText}>회원탈퇴</Text>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MyPageScreen;