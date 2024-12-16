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
  StyleSheet,
  Image,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { productService } from '../../services/api';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { MainTabParamList } from '../../navigation/types';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';

interface Book {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  published_at: string;
  category: string;
}

interface ImageType {
  uri: string;
}

type SellScreenRouteProp = RouteProp<MainTabParamList, 'Sell'>;

interface SellScreenProps {
  route: SellScreenRouteProp;
}

const SellScreen = ({ route }: SellScreenProps) => {
  const bookInfo = route.params?.bookInfo;
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [book_condition, setbook_condition] = useState('A');
  const [can_trade, setcan_trade] = useState('O');
  const [images, setImages] = useState<ImageType[]>([]);
  const { user } = useAuth();
  const navigation = useNavigation();

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
    if (!user) {
      Alert.alert('알림', '로그인이 필요한 서비스입니다.');
      return;
    }

    if (!bookInfo) {
      Alert.alert('알림', '도서 정보가 필요합니다.');
      return;
    }

    try {
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
        price: parseInt(price),
        book_condition,
        can_trade,
        description,
        images: imageUrls,
        isbn: bookInfo.isbn,
        title: bookInfo.title
      };

      await productService.createProduct(productData, user.id);

      Alert.alert('성공', '상품이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack();
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
            onValueChange={(itemValue) => setcan_trade(itemValue)}
          >
            <Picker.Item label='O' value="true" />
            <Picker.Item label='X' value="false" />
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
