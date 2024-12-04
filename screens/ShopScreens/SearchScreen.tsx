// SearchScreen.tsx
import React, { useState } from 'react';
import { searchScreenstyles as styles } from '../../styles/SearchScreenStyles';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';


// navigation prop의 타입 정의
type SearchScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

interface ItemData {
  id: string;
  title: string;
  price: string;
  image: string;
  time: string;
}

// DUMMY_ITEMS 데이터 추가
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

const SearchScreen = ({ navigation }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ItemData[]>([]);

  // 검색 로직 구현
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // DUMMY_ITEMS에서 검색어를 포함하는 항목 필터링
    const filteredResults = DUMMY_ITEMS.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const renderItem = ({ item }: { item: ItemData }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="책 제목을 입력하세요"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleSearch('')}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? '검색 결과가 없습니다'
                : '검색어를 입력해주세요'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default SearchScreen;