import React, { useState } from 'react';
import { sellScreenStyles as styles } from '../../styles/SellScreenStyles';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { productService } from '../../services/api';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type SellScreenRouteProp = RouteProp<MainTabParamList, 'Sell'>;

interface SellScreenProps {
  route: SellScreenRouteProp;
}

const SellScreen = ({ route }: SellScreenProps) => {
  const bookInfo = route.params?.bookInfo;
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [book_condition, setbook_condition] = useState('A');
  const [can_trade, setcan_trade] = useState<boolean>(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }
  
    if (!bookInfo) {
      Alert.alert('알림', '도서 정보가 필요합니다.');
      return;
    }
  
    try {
      // 수정된 productData 생성
      const productData = {
        user_id: Number(user.id), // 직접 숫자로 변환
        title: bookInfo.title,
        price: parseInt(price),
        isbn: bookInfo.isbn,
        book_condition,
        can_trade,
        description,
        completed: false,
        published_date: new Date().toISOString()
      };
  
      console.log('Final product data:', productData);
      await productService.createProduct(productData);
  
      Alert.alert('성공', '상품이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error: any) {
      console.error('상품 등록 실패:', error);
      Alert.alert('오류', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={Cstyles.container}>
      {bookInfo && (
        <View style={styles.bookInfoContainer}>
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{bookInfo.title}</Text>
            <Text style={styles.bookAuthor}>저자: {bookInfo.author}</Text>
            <Text style={styles.bookCategory}>카테고리: {bookInfo.category}</Text>
            <Text style={styles.bookIsbn}>ISBN: {bookInfo.isbn}</Text>
          </View>
        </View>
      )}
      <View style={styles.inputSection}>
        <TextInput
          style={Cstyles.input}
          placeholder="가격 설정"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>상태 선택</Text>
          <Picker
            selectedValue={book_condition}
            style={styles.picker}
            onValueChange={(itemValue) => setbook_condition(itemValue)}
          >
            <Picker.Item label="A" value="A" />
            <Picker.Item label="B" value="B" />
            <Picker.Item label="C" value="C" />
            <Picker.Item label="D" value="D" />
            <Picker.Item label="F" value="F" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>직거래 여부</Text>
          <Picker
            selectedValue={can_trade}
            style={styles.picker}
            onValueChange={(itemValue: boolean) => setcan_trade(itemValue)}
          >
            <Picker.Item label='O' value={true} />
            <Picker.Item label='X' value={false} />
          </Picker>
        </View>

        <TextInput
          style={[Cstyles.input, styles.descriptionInput]}
          placeholder="상품 설명을 입력해주세요."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>상품 등록하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SellScreen;
