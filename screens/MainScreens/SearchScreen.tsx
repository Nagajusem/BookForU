import React, { useState, useCallback } from 'react';
import { searchScreenstyles as styles } from '../../styles/SearchScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Product } from '../../navigation/types';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';

type SearchScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen = ({ navigation }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 디바운스된 검색 쿼리 (300ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // 검색 API 호출 함수
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운스된 검색어가 변경될 때마다 검색 실행
  React.useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={Cstyles.itemContainer}
      onPress={() => navigation.navigate('Product', { item })}
    >
      <Image
        source={{ 
          uri: item.images && item.images.length > 0 
            ? `http://10.0.2.2:3000${item.images[0]}`
            : '/api/placeholder/150/150'
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString()}원
        </Text>
        <Text>{item.created_at}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={Cstyles.container}>
      <View style={Cstyles.header}>
        <TouchableOpacity
          style={Cstyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="책 제목을 입력하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View >
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View>
          <Text>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={Cstyles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? '검색 결과가 없습니다'
                  : '검색어를 입력해주세요'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;