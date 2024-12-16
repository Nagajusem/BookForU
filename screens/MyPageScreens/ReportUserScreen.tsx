// screens/ReportScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles';

const ReportScreen = ({ route }) => {
  const navigation = useNavigation();
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [detailReason, setDetailReason] = useState('');
  const { itemId, sellerId } = route.params; // 신고할 상품 ID와 판매자 ID

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('알림', '신고 사유를 선택해주세요.');
      return;
    }

    try {
      // API 호출 로직 구현 필요
      const response = await reportService.createReport({
        itemId,
        sellerId,
        reasonId: selectedReason,
        detail: detailReason,
      });

      Alert.alert('알림', '신고가 접수되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '신고 접수에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={Cstyles.header}>
        <TouchableOpacity
          style={Cstyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>신고하기</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>신고 사유 선택</Text>
        
        {REPORT_REASONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.reasonItem,
              selectedReason === item.id && styles.selectedReason,
            ]}
            onPress={() => setSelectedReason(item.id)}
          >
            <Text style={[
              styles.reasonText,
              selectedReason === item.id && styles.selectedReasonText,
            ]}>
              {item.reason}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>상세 내용</Text>
        <TextInput
          style={styles.detailInput}
          multiline
          placeholder="상세 신고 사유를 입력해주세요. (선택사항)"
          value={detailReason}
          onChangeText={setDetailReason}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>신고하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  reasonItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedReason: {
    backgroundColor: '#007AFF',
  },
  reasonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  selectedReasonText: {
    color: '#fff',
  },
  detailInput: {
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;