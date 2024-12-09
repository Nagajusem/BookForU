import { StyleSheet } from 'react-native';

export const chatScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chatTime: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#1a1a1a',
    padding: 8,
    borderRadius: 12,
  },
  senderName: {
    fontSize: 12,
    color: '#8e8e8e',
    marginBottom: 2,
  },
  messageTime: {
    fontSize: 10,
    color: '#8e8e8e',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
});