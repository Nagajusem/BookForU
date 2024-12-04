import React from 'react';
import { HomeScreenStyles as styles } from '../../styles/HomeScreenStyles';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// 상품 아이템의 타입 정의
interface ItemData {
  id: string;
  title: string;
  price: string;
  image: string;
  time: string;
}

// 임시 데이터
const DUMMY_ITEMS: ItemData[] = [
  {
    id: '1',
    title: '정역학 팝니다',
    price: '17,000원',
    image: 'https://media.bunjang.co.kr/product/184221058_1_1649158987_w360.jpg',
    time: '5분 전',
  },
  {
    id: '2',
    title: '브라운 일반화학 12판 상태 양호',
    price: '25,000원',
    image: 'https://lh6.googleusercontent.com/proxy/eJ-jfp6oSECbSdYCPp0fAfLuMvuZeDy4xCBa5N4hRrww_COYpkxi0Cpwrn3xyzXt-nQi9tIReT19ClV1-6ZLqRW9bK_79HGXKW7KRX9l',
    time: '15분 전',
  },
];

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const renderItem = ({ item }: { item: ItemData }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Product', { item })}
    >
      <Image
        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
        style={styles.itemImage}
        // 이미지 로딩 실패 시 대체 이미지 설정
        defaultSource={require('../../images/브라운 일반화학 12판.jpg')}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BookForU</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={DUMMY_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item: ItemData) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;