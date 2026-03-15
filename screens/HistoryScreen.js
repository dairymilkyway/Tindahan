import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllBarcodes, refreshProductDetails, deleteBarcode } from '../database/db';
import ItemDetailsModal from '../components/ItemDetailsModal';

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadItems = async () => {
    console.log('loadItems called');
    try {
      console.log('Calling getAllBarcodes...');
      const data = await getAllBarcodes();
      console.log('Got data:', data.length, 'items');
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('useFocusEffect triggered');
      loadItems();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${selectedItem?.product_name || selectedItem?.barcode}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBarcode(selectedItem.barcode);
            setSelectedItem(null);
            loadItems();
          },
        },
      ]
    );
  };

  const handleRefreshProduct = async () => {
    Alert.alert('Refreshing', 'Fetching product details...');
    const result = await refreshProductDetails(selectedItem.barcode);
    if (result) {
      Alert.alert('Success', `Product: ${result.product_name}\nBrand: ${result.brand}`);
      loadItems();
      const updated = items.find(i => i.barcode === selectedItem.barcode);
      if (updated) setSelectedItem(updated);
    } else {
      Alert.alert('Not Found', 'Product details not found');
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No barcodes scanned yet</Text>
      <Text style={styles.emptySubtext}>Scan some barcodes to see them here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemInfo}>
                {item.product_name ? (
                  <>
                    <Text style={styles.productName} numberOfLines={2}>{item.product_name}</Text>
                    <Text style={styles.brand}>{item.brand}</Text>
                  </>
                ) : (
                  <Text style={styles.noProduct}>Tap to fetch product details</Text>
                )}
                <Text style={styles.barcode}>{item.barcode}</Text>
                <Text style={styles.date}>
                  {new Date(item.scanned_at).toLocaleString()}
                </Text>
              </View>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      />

      <ItemDetailsModal
        visible={selectedItem !== null}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  barcode: {
    fontSize: 16,
    color: '#666',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  brand: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  noProduct: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalBrand: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  modalBarcode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
