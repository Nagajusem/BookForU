import { StyleSheet } from 'react-native';

export const searchScreenstyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    backButton: {
      padding: 5,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      marginLeft: 10,
      paddingHorizontal: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
    },
    clearButton: {
      padding: 5,
    },
    itemContainer: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 15,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: 16,
      marginBottom: 5,
    },
    itemPrice: {
      fontSize: 14,
      color: '#666',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
    },
  });