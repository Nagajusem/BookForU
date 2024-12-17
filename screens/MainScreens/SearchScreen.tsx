import React, { useState, useCallback, useEffect } from 'react';
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
import { HomeStackParamList } from '../../navigation/types';
import { useDebounce } from '../../hooks/useDebounce';
import { bookService, Book } from '../../services/api';

type SearchScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen = ({ navigation }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      const results = await bookService.searchBooks('isbn', query);
      setSearchResults(results);
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity 
      style={Cstyles.itemContainer}
      onPress={() => navigation.navigate('Product', { 
        item: {
          ...item,
          id: parseInt(item.isbn), // ISBN을 임시 ID로 사용
          price: 0, // 기본값 설정
          description: '',
          published_date: new Date().toISOString(),
          images: [],
          book_condition: '',
          can_trade: false,
          completed: false,
          user_id: 0
        }
      })}
    >
      <Image
        source={{ 
          uri: `http://noum.iptime.org:9000/books/thumbnail?isbn=${item.isbn}`,
          headers: {
            Accept: 'image/jpeg, image/png, image/jpg, application/json'
          }
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text>{item.author}</Text>
        <Text>{item.publisher}</Text>
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
            placeholder="ISBN을 입력하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="numeric"
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
        <View style={Cstyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={Cstyles.emptyContainer}>
          <Text>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.isbn}
          ListEmptyComponent={
            <View style={Cstyles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? '검색 결과가 없습니다'
                  : 'ISBN을 입력해주세요'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;