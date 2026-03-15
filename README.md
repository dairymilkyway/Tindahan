# Tindahan

A mobile application for scanning and tracking consumer products using barcodes, built with React Native and Expo.

## Overview

Tindahan (Filipino word for "store" or "shop") is a mobile application that allows users to scan product barcodes and retrieve detailed product information from the [Open Food Facts](https://world.openfoodfacts.org/) database. The app stores scan history locally and displays nutritional information, Nutri-Score, and Eco-Score for each scanned product.

## Features

- **Barcode Scanning** - Scan product barcodes using the device camera (supports QR, EAN-13, EAN-8, UPC-A, UPC-E, Code 39, Code 128, Codabar, ITF-14)
- **Product Information** - Automatic retrieval of product details including name, brand, image, quantity, categories, allergens, and labels
- **Nutritional Data** - Display of nutritional information per 100g (energy, proteins, fat, carbohydrates, sugars, saturated fat, salt, fiber)
- **Health Scores** - Nutri-Score and Eco-Sgrade ratings
- **Local Storage** - All scanned items stored locally using SQLite for offline access
- **Scan History** - View and manage all previously scanned products

## Technology Stack

- **Framework**: [Expo](https://expo.dev/) SDK 55
- **Language**: JavaScript/React Native
- **UI Components**: React Native
- **Navigation**: React Navigation 7 (Bottom Tabs)
- **Camera**: expo-camera
- **Database**: expo-sqlite (SQLite)
- **API**: [Open Food Facts API](https://world.openfoodfacts.org/)
- **Icons**: @expo/vector-icons (Ionicons)

### Key Dependencies

| Package | Version |
|---------|---------|
| expo | ~55.0.6 |
| react | 19.2.0 |
| react-native | 0.83.2 |
| @react-navigation/native | ^7.1.33 |
| @react-navigation/bottom-tabs | ^7.15.5 |
| expo-camera | ^55.0.9 |
| expo-sqlite | ^55.0.10 |

## Project Structure

```
Tindahan/
├── App.js                    # Main app component with navigation
├── index.js                  # App entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── database/
│   └── db.js                 # SQLite database operations & API calls
├── screens/
│   ├── ScannerScreen.js      # Barcode scanner screen
│   └── HistoryScreen.js      # Scan history list screen
├── components/
│   └── ItemDetailsModal.js   # Product details modal component
└── assets/                   # App icons and splash screens
```

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI
- For physical device: Expo Go app
- For Android emulator: Android Studio
- For iOS simulator: Xcode (macOS only)

### Installation

1. **Clone the repository**
   ```bash
   cd tindahan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # For Android
   npm run android

   # For iOS (macOS only)
   npm run ios

   # For Web
   npm run web
   ```

   Or press `a` for Android, `i` for iOS in the Expo development server.

### Building for Production

- **Android APK**: Run `eas build -p android` (requires Expo Account)
- **iOS**: Run `eas build -p ios` (requires Expo Account and macOS)

## Usage

1. **Grant Camera Permission** - The app will request camera access for barcode scanning
2. **Scan a Barcode** - Point your camera at a product barcode
3. **View Results** - Product information will be displayed after scanning
4. **Access History** - Switch to the History tab to view all scanned items
5. **View Details** - Tap any item in history to see full product details including nutritional information
6. **Delete Items** - Remove unwanted scans from history

## API Integration

The app integrates with the [Open Food Facts API](https://world.openfoodfacts.org/api):

- **Endpoint**: `https://world.openfoodfacts.org/api/v0/product/{barcode}.json`
- **Data Retrieved**: Product name, brand, image, quantity, categories, allergens, labels, nutritional values, Nutri-Score, Eco-Score

## Database Schema

The SQLite database contains a single table `scanned_items`:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| barcode | TEXT | Unique barcode |
| scanned_at | TEXT | Timestamp of scan |
| product_name | TEXT | Product name |
| brand | TEXT | Brand name |
| image_url | TEXT | Product image URL |
| quantity | TEXT | Package quantity |
| categories | TEXT | Product categories |
| allergens | TEXT | Allergen information |
| labels | TEXT | Product labels |
| energy_kcal | REAL | Energy per 100g |
| proteins | REAL | Protein per 100g |
| fat | REAL | Fat per 100g |
| carbohydrates | REAL | Carbs per 100g |
| sugars | REAL | Sugars per 100g |
| saturated_fat | REAL | Saturated fat per 100g |
| salt | REAL | Salt per 100g |
| fiber | REAL | Fiber per 100g |
| nutriscore_grade | TEXT | Nutri-Score (A-E) |
| ecoscore_grade | TEXT | Eco-Score (A-E) |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Screenshots

The app features:
- A scanner screen with camera preview and scan overlay
- A history screen with list of scanned items
- Modal dialogs showing detailed product information including nutritional facts

---

Built with React Native and Expo