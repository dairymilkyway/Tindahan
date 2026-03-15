import React, { useState } from 'react';
import { Text, View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Image, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { insertBarcodeWithProductDetails } from '../database/db';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmBarcode, setConfirmBarcode] = useState(null);
  const [confirmTimeout, setConfirmTimeout] = useState(null);
  const [resultModal, setResultModal] = useState({ visible: false, existing: false, barcode: '', productInfo: null, scannedAt: '' });

  const handleBarCodeScanned = async ({ type, data }) => {
    console.log('Barcode scanned - type:', type, 'data:', data);
    if (scanned || processing || confirming) return;
    
    setConfirming(true);
    setConfirmBarcode(data);
    
    const timeout = setTimeout(async () => {
      setConfirming(false);
      setScanned(true);
      setProcessing(true);
      setConfirmBarcode(null);

      try {
        const result = await insertBarcodeWithProductDetails(data);

        const date = new Date(result.scannedAt).toLocaleString();
        setResultModal({
          visible: true,
          existing: result.existing,
          barcode: data,
          productInfo: result.productInfo,
          scannedAt: date,
        });
      } catch (error) {
        setProcessing(false);
        console.error('Scan error:', error);
        Alert.alert('Error', 'Failed to scan barcode', [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    }, 4000);
    
    setConfirmTimeout(timeout);
  };

  const cancelConfirm = () => {
    if (confirmTimeout) {
      clearTimeout(confirmTimeout);
      setConfirmTimeout(null);
    }
    setConfirming(false);
    setConfirmBarcode(null);
  };

  const closeResultModal = () => {
    setResultModal({ ...resultModal, visible: false });
    setScanned(false);
    setProcessing(false);
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to scan barcodes</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128', 'codabar', 'itf14'],
        }}
        onBarcodeScanned={scanned || confirming ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          {processing && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00FF00" />
              <Text style={styles.loadingText}>Fetching product details...</Text>
            </View>
          )}
          {confirming && (
            <View style={styles.confirmBox}>
              <ActivityIndicator size="large" color="#00FF00" />
              <Text style={styles.confirmBarcode}>{confirmBarcode}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelConfirm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.instructions}>
            {scanned ? 'Processing...' : confirming ? 'Confirming...' : 'Point camera at barcode'}
          </Text>
        </View>
      </CameraView>

      <Modal visible={resultModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: resultModal.existing ? '#FF9500' : '#34C759' }]}>
              {resultModal.existing ? 'Already Scanned' : 'Registered Successfully'}
            </Text>
            {resultModal.productInfo?.image_url && (
              <Image source={{ uri: resultModal.productInfo.image_url }} style={styles.modalImage} />
            )}
            {resultModal.productInfo ? (
              <>
                <Text style={styles.modalProductName}>{resultModal.productInfo.product_name}</Text>
                <Text style={styles.modalBrand}>{resultModal.productInfo.brand}</Text>
              </>
            ) : (
              <Text style={styles.modalNoProduct}>Product details not found</Text>
            )}
            <Text style={styles.modalBarcode}>{resultModal.barcode}</Text>
            <Text style={styles.modalDate}>Scanned at: {resultModal.scannedAt}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeResultModal}>
              <Text style={styles.modalButtonText}>
                {resultModal.existing ? 'Scan Again' : 'Scan Another'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00FF00',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingBox: {
    position: 'absolute',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  confirmBox: {
    position: 'absolute',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: 200,
  },
  confirmBarcode: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 15,
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalBrand: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 10,
  },
  modalNoProduct: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  modalBarcode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
