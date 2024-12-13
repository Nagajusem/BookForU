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
import { HomeStackParamList, FormattedProduct } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<FormattedProduct[]>([]); // Product를 FormattedProduct로 변경
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(); 
      setProducts(data);
    } catch (error) {
      Alert.alert('에러', '상품을 불러오는데 실패했습니다.');
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
        source={{ uri: item.thumbnailUrl }} 
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