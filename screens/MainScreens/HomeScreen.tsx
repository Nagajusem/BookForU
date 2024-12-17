import React, { useEffect, useState } from 'react';
import { HomeScreenStyles as styles } from '../../styles/HomeScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Product, FormattedProduct, productService } from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList,  } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<FormattedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let products = await productService.getProducts();
      
      // 날짜 기준으로 정렬 (최신순)
      products = products.sort((a, b) => {
        const dateA = new Date(a.published_date);
        const dateB = new Date(b.published_date);
        return dateB.getTime() - dateA.getTime();
      });
      
      setProducts(products);
    } catch (error) {
      console.error('상품 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: FormattedProduct }) => (
    <TouchableOpacity 
      style={Cstyles.itemContainer}
      onPress={() => navigation.navigate('Product', { item })}
    >
      <Image
        source={{ 
          uri: `http://noum.iptime.org:9000/books/thumbnail?isbn=${item.isbn}`,
          headers: {
            Accept: 'image/jpeg, image/png, image/jpg, application/json'
          }
        }}
        style={[Cstyles.itemImage, { backgroundColor: '#f0f0f0' }]}
        resizeMode="contain"
        onError={(e) => console.log('이미지 로드 실패:', e.nativeEvent.error)}
      />
      <View style={Cstyles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.bookInfo?.title || item.title}
        </Text>
        <Text style={Cstyles.itemPrice}>
          {item.price.toLocaleString()}원
        </Text>
        <Text style={styles.itemTime}>
          {new Date(item.published_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={Cstyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={Cstyles.container}>
      <View style={Cstyles.header}>
        <Image
          source={require('../../assets/bookforu.png')} 
          style={{
            width: 120,
            height: 40,
            resizeMode: 'contain'
          }}
        />
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
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={loadProducts}
        refreshing={loading}
        ListEmptyComponent={
          <View style={Cstyles.emptyContainer}>
            <Text>등록된 상품이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
export default HomeScreen;