import React, { useState, useEffect } from 'react';  
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, SellStackParamList } from '../../navigation/types';
import { useDebounce } from '../../hooks/useDebounce';
import { Book, bookService } from '../../services/api';

type BookSearchScreenNavigationProp = NativeStackNavigationProp<SellStackParamList, 'BookSearch'>;

interface BookSearchScreenProps {
  navigation: BookSearchScreenNavigationProp;
}

const BookSearchScreen = ({ navigation }: BookSearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'isbn'>('title');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchBooks = async () => {
      // 검색어가 2글자 미만이면서 ISBN 검색이 아닌 경우 검색하지 않음
      if (!debouncedSearchQuery.trim() || 
          (searchType === 'title' && debouncedSearchQuery.trim().length < 2)) {
        setSearchResults([]);
        return;
      }
  
      setIsLoading(true);
      setError(null);
  
      try {
        const results = await bookService.searchBooks(searchType, debouncedSearchQuery);
        console.log('검색 결과:', results);
        setSearchResults(results);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('검색 중 오류가 발생했습니다.');
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    searchBooks();
  }, [debouncedSearchQuery, searchType]);

  const handleBookSelect = (book: Book) => {
    try {
      // 네비게이션 호출 전에 console.log로 확인
      console.log('Selected book:', book);
      navigation.navigate('Sell', { bookInfo: book });
    } catch (error) {
      console.error('Navigation error:', error);
      // 오류 처리
      Alert.alert('오류', '페이지 이동 중 문제가 발생했습니다.');
    }
  };

  const toggleSearchType = () => {
    setSearchType(prev => prev === 'title' ? 'isbn' : 'title');
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const formatDateString = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    };
  
    return (
      <TouchableOpacity 
        style={styles.bookItem}
        onPress={() => handleBookSelect(item)}
      >
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.bookAuthor}>{item.author}</Text>
          <Text style={styles.bookPublisher}>{item.publisher}</Text>
          <Text style={styles.bookCategory}>{item.category}</Text>
          <Text style={styles.bookDate}>
            {formatDateString(item.published_at)}
          </Text>
          <Text style={styles.bookIsbn}>ISBN: {item.isbn}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // 검색 결과를 표시하는 부분 수정
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.isbn}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? '검색 결과가 없습니다' : '검색어를 입력해주세요'}
            </Text>
          </View>
        }
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleSearchType}
        >
          <Icon name={searchType === 'title' ? 'title' : 'dialpad'} size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'title' ? "도서 제목을 입력하세요" : "ISBN을 입력하세요"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType={searchType === 'isbn' ? 'numeric' : 'default'}
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.isbn}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0
                  ? (error || '검색 결과가 없습니다')
                  : `${searchType === 'title' ? '도서 제목' : 'ISBN'}을 입력해주세요`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  bookItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookPublisher: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookIsbn: {
    fontSize: 12,
    color: '#999',
  },
});

export default BookSearchScreen;