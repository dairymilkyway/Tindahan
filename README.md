# Tindahan

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.83.2-61DAFB?style=for-the-badge&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-55.0.6-000020?style=for-the-badge&logo=expo" alt="Expo">
  <img src="https://img.shields.io/badge/Platform-Cross%20Platform-blue?style=for-the-badge&logo=device">
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge">
</p>

> Tindahan (Filipino for "store" or "shop") - A mobile application for scanning and tracking consumer products using barcodes, powered by the Open Food Facts database.

##

<p align="center">
  <a href="#features">Features</a> •
  <a href="#technology-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

Tindahan is a mobile application that allows users to scan product barcodes and retrieve detailed product information from the [Open Food Facts](https://world.openfoodfacts.org/) database. The app stores scan history locally using SQLite and displays nutritional information, Nutri-Score, and Eco-Score for each scanned product.

##

## Features

| Feature | Description |
|---------|-------------|
| 📷 **Barcode Scanning** | Scan product barcodes using the device camera (supports QR, EAN-13, EAN-8, UPC-A, UPC-E, Code 39, Code 128, Codabar, ITF-14) |
| 📦 **Product Information** | Automatic retrieval of product details including name, brand, image, quantity, categories, allergens, and labels |
| 🍎 **Nutritional Data** | Display of nutritional information per 100g (energy, proteins, fat, carbohydrates, sugars, saturated fat, salt, fiber) |
| 🏆 **Health Scores** | Nutri-Score and Eco-Score ratings with color-coded badges |
| 💾 **Local Storage** | All scanned items stored locally using SQLite for offline access |
| 📋 **Scan History** | View, refresh, and manage all previously scanned products |

---

## Technology Stack

### Core Technologies

| Technology | Description |
|------------|-------------|
| **Expo SDK 55** | Framework for building native apps with React |
| **React Native 0.83.2** | Cross-platform mobile framework |
| **React 19.2.0** | UI library |
| **SQLite** | Local database via expo-sqlite |

### Key Dependencies

```javascript
{
  "expo": "~55.0.6",
  "react": "19.2.0",
  "react-native": "0.83.2",
  "@react-navigation/native": "^7.1.33",
  "@react-navigation/bottom-tabs": "^7.15.5",
  "expo-camera": "^55.0.9",
  "expo-sqlite": "^55.0.10"
}
```

### External Services

- **API**: [Open Food Facts API](https://world.openfoodfacts.org/api)
- **Icons**: @expo/vector-icons (Ionicons)
- **Navigation**: React Navigation 7 (Bottom Tabs)

---

## Getting Started

### Prerequisites

| Requirement | Description |
|-------------|-------------|
| Node.js | LTS version recommended |
| npm or yarn | Package manager |
| Expo CLI | `npm install -g expo-cli` |
| Expo Go | For physical device testing |
| Android Studio | For Android emulator |
| Xcode | For iOS simulator (macOS only) |

### Quick Start

```bash
# 1. Navigate to project directory
cd tindahan

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Run on your preferred platform
npm run android    # Android
npm run ios        # iOS (macOS only)
npm run web        # Web
```

> **Tip**: Press `a` for Android or `i` for iOS in the Expo development server.

### Building for Production

```bash
# Android APK
eas build -p android

# iOS (requires macOS)
eas build -p ios
```

> **Note**: Building requires an Expo account.

---

## Project Structure

```
Tindahan/
├── App.js                    # Main app component with navigation setup
├── index.js                  # App entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies
│
├── database/
│   └── db.js                 # SQLite operations, API calls, caching
│
├── screens/
│   ├── ScannerScreen.js      # Barcode scanner with camera
│   └── HistoryScreen.js      # Scan history list
│
├── components/
│   └── ItemDetailsModal.js   # Product details modal with nutrition info
│
└── assets/                   # App icons, splash screens
```

---

## Usage

### Step-by-Step Guide

1. **Grant Camera Permission** - The app will request camera access for barcode scanning
2. **Scan a Barcode** - Point your camera at a product barcode
3. **View Results** - Product information will be displayed after scanning
4. **Access History** - Switch to the History tab to view all scanned items
5. **View Details** - Tap any item in history to see full product details
6. **Delete Items** - Remove unwanted scans from history

---

## API Integration

### Open Food Facts API

```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

**Response Data:**

| Field | Description |
|-------|-------------|
| `product_name` | Product name |
| `brand` | Brand name |
| `image_url` | Product image |
| `quantity` | Package quantity |
| `categories` | Product categories |
| `allergens` | Allergen information |
| `labels` | Product labels |
| `nutriments` | Nutritional values (per 100g) |
| `nutriscore_grade` | Nutri-Score (A-E) |
| `ecoscore_grade` | Eco-Score (A-E) |

---

## Database Schema

### Table: `scanned_items`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `barcode` | TEXT | Unique product barcode |
| `scanned_at` | TEXT | ISO timestamp of scan |
| `product_name` | TEXT | Product name |
| `brand` | TEXT | Brand name |
| `image_url` | TEXT | Product image URL |
| `quantity` | TEXT | Package quantity |
| `categories` | TEXT | Product categories |
| `allergens` | TEXT | Allergen information |
| `labels` | TEXT | Product labels |
| `energy_kcal` | REAL | Energy (kcal) per 100g |
| `proteins` | REAL | Protein per 100g |
| `fat` | REAL | Fat per 100g |
| `carbohydrates` | REAL | Carbohydrates per 100g |
| `sugars` | REAL | Sugars per 100g |
| `saturated_fat` | REAL | Saturated fat per 100g |
| `salt` | REAL | Salt per 100g |
| `fiber` | REAL | Fiber per 100g |
| `nutriscore_grade` | TEXT | Nutri-Score (A-E) |
| `ecoscore_grade` | TEXT | Eco-Score (A-E) |

---

## Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add some amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## License

<p align="center">
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" alt="License">
</p>

<p align="center">
  This project is private and proprietary. All rights reserved.
</p>

---

<div align="center">

**Built with** 💙 **using React Native & Expo**

</div>