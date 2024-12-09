import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,
    backgroundColor: '#dec8ac',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },

  // Headers
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },

  // Common list items
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  // Text styles
  text: {
    fontSize: 14,
    color: '#0b6799',
  },
  smallText: {
    fontSize: 12,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#8e8e8e',
  },

  // Buttons
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
});