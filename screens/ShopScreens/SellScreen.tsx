// SellScreen.tsx 수정
import React, { useState } from 'react';
import { sellScreenStyles as styles } from '../../styles/SellScreenStyles';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { productService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const SellScreen = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('a');
  const [handonhand, setHandonhand] = useState('O');
  const navigation = useNavigation();
  const [images, setImages] = useState<Array<{ uri: string }>>([]);
  const handleAddImage = () => {
    // 나중에 이미지 업로드 기능 구현
    console.log('미구현');
  };

  const handleSubmit = async () => {
    if (!title || !price || !description) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      const productData = {
        title,
        price: parseInt(price),
        status,
        handonhand,
        description
      };

      await productService.createProduct(productData);
      Alert.alert('성공', '상품이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.navigate('HomeMain');
          }
        }
      ]);
    } catch (error) {
      console.error('상품 등록 실패:', error);
      Alert.alert('오류', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageSection}>
        <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
          <Icon name="add-a-photo" size={24} color="#666" />
          <Text style={styles.addImageText}>사진 추가 (0/10)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={styles.input}
          placeholder="가격 설정"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>상태 선택</Text>
          <Picker
            selectedValue={status}
            style={styles.picker}
            onValueChange={(itemValue) => setStatus(itemValue)}
          >
            <Picker.Item label="A+" value="a" />
            <Picker.Item label="A" value="b" />
            <Picker.Item label="B+" value="c" />
            <Picker.Item label="B" value="d" />
            <Picker.Item label="C" value="e" />
            <Picker.Item label="F" value="f" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>직거래 여부</Text>
          <Picker
            selectedValue={handonhand}
            style={styles.picker}
            onValueChange={(itemValue) => setHandonhand(itemValue)}
          >
            <Picker.Item label='O' value="O" />
            <Picker.Item label='X' value="X" />
          </Picker>
        </View>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
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
