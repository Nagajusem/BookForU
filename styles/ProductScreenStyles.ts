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
      bookTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000',
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      reasonButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      reasonText: {
        fontSize: 16,
        color: '#333',
      },
      cancelButton: {
        marginTop: 16,
        alignItems: 'center',
      },
      cancelText: {
        fontSize: 16,
        color: '#666',
      },
      reportButton: {
        padding: 8,
      },
      headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginHorizontal: 16,
      },

      buyerButtonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
      },
      chatButton: {
        flex: 0.8,
        height: 52,
        backgroundColor: '#FF6B6B',
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
      chatButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      wishlistButton: {
        flex: 0.2,
        height: 52,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF6B6B',
      },
      completedContainer: {
        paddingHorizontal: 16,
        width: '100%',
      },
      completedButton: {
        height: 52,
        backgroundColor: '#999',
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
      completedButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
});