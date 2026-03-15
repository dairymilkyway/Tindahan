import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';

export default function ItemDetailsModal({ visible, item, onClose, onDelete }) {
  const [imageHeight, setImageHeight] = useState(150);
  const [showMoreModal, setShowMoreModal] = useState(false);

  useEffect(() => {
    if (item?.image_url) {
      Image.getSize(item.image_url, (width, height) => {
        const maxWidth = 200;
        const ratio = maxWidth / width;
        setImageHeight(height * ratio);
      }, () => {
        setImageHeight(150);
      });
    }
  }, [item?.image_url]);

  const handleViewMore = () => {
    setShowMoreModal(true);
  };

  const handleCloseMore = () => {
    setShowMoreModal(false);
    onClose();
  };

  if (!item) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
            
            {item.image_url && (
              <Image 
                source={{ uri: item.image_url }} 
                style={[styles.modalImage, { height: imageHeight }]} 
                resizeMode="contain"
              />
            )}
            
            <Text style={styles.modalProductName}>
              {item.product_name || 'Unknown Product'}
            </Text>
            <Text style={styles.modalBrand}>{item.brand || 'Unknown Brand'}</Text>
            <Text style={styles.modalBarcode}>Barcode: {item.barcode}</Text>
            <Text style={styles.modalDate}>
              Scanned: {new Date(item.scanned_at).toLocaleString()}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMore}>
                <Text style={styles.viewMoreButtonText}>View More</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.moreModalContent}>
            <Pressable style={styles.closeButton} onPress={() => setShowMoreModal(false)}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false}>
              {item.product_name ? (
                <>
                  {item.image_url && (
                    <Image 
                      source={{ uri: item.image_url }} 
                      style={styles.moreModalImage}
                      resizeMode="contain"
                    />
                  )}
                  
                  <Text style={styles.moreModalTitle}>{item.product_name}</Text>
                  <Text style={styles.moreModalBrand}>{item.brand}</Text>

                  {item.quantity && (
                    <Text style={styles.moreModalText}>Quantity: {item.quantity}</Text>
                  )}

                  {item.categories && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Category</Text>
                      <Text style={styles.sectionText}>{item.categories}</Text>
                    </View>
                  )}

                  {item.allergens && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Allergens</Text>
                      <Text style={styles.allergensText}>{item.allergens}</Text>
                    </View>
                  )}

                  {item.labels && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Labels</Text>
                      <Text style={styles.sectionText}>{item.labels}</Text>
                    </View>
                  )}

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.energy_kcal ? Math.round(item.energy_kcal) : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Energy (kcal)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.proteins ? Math.round(item.proteins * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Protein (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.fat ? Math.round(item.fat * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Fat (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.carbohydrates ? Math.round(item.carbohydrates * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Carbs (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.sugars ? Math.round(item.sugars * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Sugars (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.saturated_fat ? Math.round(item.saturated_fat * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Sat. Fat (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.salt ? Math.round(item.salt * 100) / 100 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Salt (g)</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{item.fiber ? Math.round(item.fiber * 10) / 10 : 'N/A'}</Text>
                        <Text style={styles.nutritionLabel}>Fiber (g)</Text>
                      </View>
                    </View>
                  </View>

                  {item.nutriscore_grade && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Nutri-Score</Text>
                      <View style={[styles.gradeBadge, { backgroundColor: getNutriScoreColor(item.nutriscore_grade) }]}>
                        <Text style={styles.gradeText}>{item.nutriscore_grade.toUpperCase()}</Text>
                      </View>
                    </View>
                  )}

                  {item.ecoscore_grade && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Eco-Score</Text>
                      <View style={[styles.gradeBadge, { backgroundColor: getEcoScoreColor(item.ecoscore_grade) }]}>
                        <Text style={styles.gradeText}>{item.ecoscore_grade.toUpperCase()}</Text>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>No additional details available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getNutriScoreColor = (grade) => {
  const colors = { a: '#038141', b: '#85BB2F', c: '#FECB02', d: '#EE8100', e: '#E63E11' };
  return colors[grade] || '#999';
};

const getEcoScoreColor = (grade) => {
  const colors = { a: '#038141', b: '#85BB2F', c: '#FECB02', d: '#EE8100', e: '#E63E11' };
  return colors[grade] || '#999';
};

const styles = StyleSheet.create({
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
  moreModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalImage: {
    width: 200,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
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
  viewMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewMoreButtonText: {
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  moreModalImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignSelf: 'center',
    marginBottom: 15,
  },
  moreModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  moreModalBrand: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  moreModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 13,
    color: '#666',
  },
  allergensText: {
    fontSize: 13,
    color: '#EE8100',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutritionItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  gradeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  gradeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
