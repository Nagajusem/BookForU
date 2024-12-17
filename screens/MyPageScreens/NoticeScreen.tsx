import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CommonStyles as Cstyles } from '../../styles/CommonStyles';
import api from '../../services/api';

interface Notice {
  id: number;
  type: string;
  title: string;
  content: string;
  created_at: string;
}

const NoticeScreen = ({ navigation }: any) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/admin/notice');
      const formattedNotices = response.data.map((notice: any) => ({
        ...notice,
        created_at: new Date(notice.created_at).toLocaleDateString('ko-KR')
      }));
      setNotices(formattedNotices);
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      Alert.alert('오류', '공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderNoticeItem = ({ item }: { item: Notice }) => (
    <TouchableOpacity
      style={styles.noticeItem}
      onPress={() => Alert.alert('공지사항', item.content)}
    >
      <View style={styles.noticeHeader}>
        <Text style={styles.noticeType}>{item.type}</Text>
        <Text style={styles.noticeDate}>{item.created_at}</Text>
      </View>
      <Text style={styles.noticeTitle}>{item.title}</Text>
      <Text style={styles.noticeContent} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={Cstyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
      </View>

      <FlatList
        data={notices}
        renderItem={renderNoticeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.noticeList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 공지사항이 없습니다.</Text>
          </View>
        }
      />
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  noticeList: {
    padding: 16,
  },
  noticeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticeType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  noticeDate: {
    fontSize: 12,
    color: '#666',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  noticeContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NoticeScreen;