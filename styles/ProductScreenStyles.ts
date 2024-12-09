import { StyleSheet } from 'react-native';

export const ProductScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      backButton: {
        padding: 5,
      },
      image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover'
      },
      contentContainer: {
        padding: 20,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      price: {
        fontSize: 18,
        color: '#FF6B6B',
        fontWeight: 'bold',
        marginBottom: 5,
      },
      time: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
      },
      divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 15,
      },
      sellerInfo: {
        marginBottom: 15,
      },
      sellerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
      },
      sellerName: {
        fontSize: 14,
        color: '#333',
      },
      description: {
        marginBottom: 20,
      },
      descriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      descriptionText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
      },
      footer: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
      },
      chatButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
      },
      chatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },

      sellerButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        gap: 12,
      },
      sellerButton: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      deleteButton: {
        backgroundColor: '#ff4444',
      },
      completeButton: {
        backgroundColor: '#007AFF',
      },
      deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      completeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      imageContainer: {
        height: 300,
      },
      
});