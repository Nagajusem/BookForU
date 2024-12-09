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
import { productService } from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  handonhand: string;
  description: string;
  seller_name: string;
  created_at: string;
  images: string[]; 
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...'); // 로그 추가
      const data = await productService.getProducts();
      console.log('Fetched products:', data); // 로그 추가
      setProducts(data);
    } catch (error) {
      console.error('Detailed error:', error);
      Alert.alert('에러', '상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
    style={Cstyles.itemContainer}
    onPress={() => navigation.navigate('Product', { item })}
  >
      <Image
        source={{ 
          uri: item.images && item.images.length > 0 
            ? `http://10.0.2.2:3000${item.images[0]}` // 안드로이드 에뮬레이터 기준 아이폰은 localhost:3000으로 보내야함
            : '/api/placeholder/150/150' // 대체 이미지
        }}
        style={Cstyles.itemImage}
        resizeMode="cover"
      />
      <View style={Cstyles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={Cstyles.itemPrice}>
          {item.price.toLocaleString()}원
        </Text>
        <Text style={styles.itemTime}>{item.created_at}</Text>
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
      />
    </SafeAreaView>
  );
};

export default HomeScreen;