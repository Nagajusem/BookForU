// SellScreen.tsx 수정
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
  Platform,
  Image,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { productService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface ImageType {
  uri: string;
}
type SellScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SellScreen = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('a');
  const [handonhand, setHandonhand] = useState('O');
  const navigation = useNavigation<SellScreenNavigationProp>();
  const [images, setImages] = useState<ImageType[]>([]);
  const handleAddImage = () => {
    Alert.alert(
      '사진 추가',
      '사진을 추가할 방법을 선택하세요',
      [
        {
          text: '카메라로 촬영',
          onPress: handleTakePhoto,
        },
        {
          text: '갤러리에서 선택',
          onPress: handleChoosePhoto,
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ],
    );
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    });

    if (result.assets && result.assets[0]?.uri) {
      setImages([...images, { uri: result.assets[0].uri }]);
    }
  };

  const handleChoosePhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      selectionLimit: 10 - images.length,
    });

    if (result.assets) {
      const newImages = result.assets
        .filter((asset): asset is typeof asset & { uri: string } => asset.uri !== undefined)
        .map(asset => ({ uri: asset.uri }));
      setImages([...images, ...newImages]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description) {
      Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      // 이미지 업로드
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image${index}.jpg`,
        });
      });
  
      const uploadResponse = await productService.uploadImages(formData);
      const imageUrls = uploadResponse.urls;
  
      const productData = {
        title,
        price: parseInt(price),
        status,
        handonhand,
        description,
        images: imageUrls
      };

      // 업로드 후 초기화
      await productService.createProduct(productData);

      setTitle('');
      setPrice('');
      setDescription('');
      setStatus('a'); 
      setHandonhand('O');  
      setImages([]); 
  
      Alert.alert('성공', '상품이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack; // 나중에 navigation.navigate('Home'); 왜 안되는지 확인
          }
        }
      ]);
    } catch (error) {
      console.error('상품 등록 실패:', error);
      Alert.alert('오류', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <ScrollView style={Cstyles.container}>
      <View style={styles.imageSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => {
                  const newImages = [...images];
                  newImages.splice(index, 1);
                  setImages(newImages);
                }}
              >
                <MaterialIcon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 10 && (
            <TouchableOpacity 
              style={styles.addImageButton} 
              onPress={handleAddImage}
            >
              <MaterialIcon name="add-a-photo" size={24} color="#666" />
              <Text style={styles.addImageText}>
                사진 추가 ({images.length}/10)
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={Cstyles.input}
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
        />
        
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
            selectedValue={status}
            style={styles.picker}
            onValueChange={(itemValue) => setStatus(itemValue)}
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
            selectedValue={handonhand}
            style={styles.picker}
            onValueChange={(itemValue) => setHandonhand(itemValue)}
          >
            <Picker.Item label='O' value="O" />
            <Picker.Item label='X' value="X" />
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
