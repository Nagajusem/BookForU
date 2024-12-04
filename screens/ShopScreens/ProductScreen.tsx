// ProductScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';
import { ProductScreenStyles as styles } from '../../styles/ProductScreenStyles';

type ProductScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Product'>;
type ProductScreenRouteProp = RouteProp<HomeStackParamList, 'Product'>;

interface ProductScreenProps {
  navigation: ProductScreenNavigationProp;
  route: ProductScreenRouteProp;
}

const ProductScreen = ({ navigation, route }: ProductScreenProps) => {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
        />
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.time}>{item.created_at}</Text>
          <Text style={styles.sellerName}>판매자 닉네임</Text>

          <View style={styles.divider} />

          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>상태</Text>
            <Text style={styles.sellerName}>A+</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerTitle}>직거래 여부</Text>
            <Text style={styles.sellerName}>O</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.description}>
            <Text style={styles.descriptionTitle}>상품 정보</Text>
            <Text style={styles.descriptionText}>
              상품에 대한 자세한 설명이 들어갈 자리입니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>채팅하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default ProductScreen;