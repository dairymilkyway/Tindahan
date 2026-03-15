import * as SQLite from 'expo-sqlite';

let db = null;
const productCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const initDatabase = async () => {
  if (db) {
    console.log('Database already initialized');
    return db;
  }
  
  db = await SQLite.openDatabaseAsync('scanner.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA cache_size = -64000;
    
    CREATE TABLE IF NOT EXISTS scanned_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      scanned_at TEXT NOT NULL,
      product_name TEXT,
      brand TEXT,
      image_url TEXT,
      quantity TEXT,
      categories TEXT,
      allergens TEXT,
      labels TEXT,
      energy_kcal REAL,
      proteins REAL,
      fat REAL,
      carbohydrates REAL,
      sugars REAL,
      saturated_fat REAL,
      salt REAL,
      fiber REAL,
      nutriscore_grade TEXT,
      ecoscore_grade TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_barcode ON scanned_items(barcode);
    CREATE INDEX IF NOT EXISTS idx_scanned_at ON scanned_items(scanned_at);
  `);
  
  const columns = await db.getAllAsync("PRAGMA table_info(scanned_items)");
  const columnNames = columns.map(c => c.name);
  
  const newColumns = [
    { name: 'quantity', type: 'TEXT' },
    { name: 'categories', type: 'TEXT' },
    { name: 'allergens', type: 'TEXT' },
    { name: 'labels', type: 'TEXT' },
    { name: 'energy_kcal', type: 'REAL' },
    { name: 'proteins', type: 'REAL' },
    { name: 'fat', type: 'REAL' },
    { name: 'carbohydrates', type: 'REAL' },
    { name: 'sugars', type: 'REAL' },
    { name: 'saturated_fat', type: 'REAL' },
    { name: 'salt', type: 'REAL' },
    { name: 'fiber', type: 'REAL' },
    { name: 'nutriscore_grade', type: 'TEXT' },
    { name: 'ecoscore_grade', type: 'TEXT' },
  ];
  
  for (const col of newColumns) {
    if (!columnNames.includes(col.name)) {
      await db.execAsync(`ALTER TABLE scanned_items ADD COLUMN ${col.name} ${col.type}`);
    }
  }
  
  console.log('Database initialized');
  
  return db;
};

export const getDatabase = () => db;

export const fetchProductDetails = async (barcode) => {
  const cached = productCache.get(barcode);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached product for:', barcode);
    return cached.data;
  }

  try {
    console.log('Fetching product for barcode:', barcode);
    
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    console.log('Request URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TindahanApp/1.0',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.log('API error:', response.status);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('API returned non-JSON response');
      return null;
    }
    
    const data = await response.json();
    console.log('API response received, status:', data.status);
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      const result = {
        product_name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || 'Unknown Brand',
        image_url: product.image_url || product.image_small_url || null,
        quantity: product.quantity || null,
        categories: product.categories || null,
        allergens: product.allergens ? product.allergens.replace(/en:/g, '').replace(/,/g, ', ') : null,
        labels: product.labels || null,
        energy_kcal: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || null,
        proteins: product.nutriments?.proteins_100g || product.nutriments?.proteins || null,
        fat: product.nutriments?.fat_100g || product.nutriments?.fat || null,
        carbohydrates: product.nutriments?.carbohydrates_100g || product.nutriments?.carbohydrates || null,
        sugars: product.nutriments?.sugars_100g || product.nutriments?.sugars || null,
        saturated_fat: product.nutriments?.['saturated-fat_100g'] || product.nutriments?.['saturated-fat'] || null,
        salt: product.nutriments?.salt_100g || product.nutriments?.salt || null,
        fiber: product.nutriments?.fiber_100g || product.nutriments?.fiber || null,
        nutriscore_grade: product.nutriscore_grade || product.nutrition_grades?.replace('en:', '') || null,
        ecoscore_grade: product.ecoscore_grade || null,
      };
      productCache.set(barcode, { data: result, timestamp: Date.now() });
      return result;
    }
    console.log('Product not found in database');
    productCache.set(barcode, { data: null, timestamp: Date.now() });
    return null;
  } catch (error) {
    console.log('Fetch error name:', error.name);
    console.log('Fetch error message:', error.message);
    productCache.set(barcode, { data: null, timestamp: Date.now() });
    return null;
  }
};

export const insertBarcode = async (barcode) => {
  if (!db) {
    await initDatabase();
  }
  
  const scannedAt = new Date().toISOString();
  console.log('Checking barcode:', barcode, 'at:', scannedAt);
  
  const existing = await db.getFirstAsync(
    'SELECT id, scanned_at, product_name, brand, image_url FROM scanned_items WHERE barcode = ?',
    [barcode]
  );
  
  if (existing) {
    console.log('Barcode already exists, id:', existing.id);
    return { 
      success: false, 
      existing: true, 
      scannedAt: existing.scanned_at,
      productInfo: existing.product_name ? {
        product_name: existing.product_name,
        brand: existing.brand,
        image_url: existing.image_url,
      } : null
    };
  }
  
  await db.runAsync(
    'INSERT INTO scanned_items (barcode, scanned_at) VALUES (?, ?)',
    [barcode, scannedAt]
  );
  console.log('Insert successful, barcode:', barcode);
  
  fetchProductDetails(barcode).then(productInfo => {
    if (productInfo && db) {
      db.runAsync(
        'UPDATE scanned_items SET product_name = ?, brand = ?, image_url = ? WHERE barcode = ?',
        [productInfo.product_name, productInfo.brand, productInfo.image_url, barcode]
      );
      console.log('Product details updated for:', barcode);
    }
  });
  
  return { success: true, scannedAt, productInfo: null, barcode };
};

export const insertBarcodeWithProductDetails = async (barcode) => {
  if (!db) {
    await initDatabase();
  }
  
  const scannedAt = new Date().toISOString();
  console.log('Checking barcode:', barcode, 'at:', scannedAt);
  
  try {
    const productInfo = await fetchProductDetails(barcode);
    
    const existing = await db.getFirstAsync(
      'SELECT * FROM scanned_items WHERE barcode = ?',
      [barcode]
    );
    
    if (existing) {
      console.log('Barcode already exists, id:', existing.id);
      
      if (!existing.product_name && productInfo) {
        await db.runAsync(
          `UPDATE scanned_items SET 
            product_name = ?, brand = ?, image_url = ?, quantity = ?, 
            categories = ?, allergens = ?, labels = ?, energy_kcal = ?,
            proteins = ?, fat = ?, carbohydrates = ?, sugars = ?,
            saturated_fat = ?, salt = ?, fiber = ?, nutriscore_grade = ?, ecoscore_grade = ?
          WHERE barcode = ?`,
          [
            productInfo.product_name, productInfo.brand, productInfo.image_url,
            productInfo.quantity, productInfo.categories, productInfo.allergens,
            productInfo.labels, productInfo.energy_kcal, productInfo.proteins,
            productInfo.fat, productInfo.carbohydrates, productInfo.sugars,
            productInfo.saturated_fat, productInfo.salt, productInfo.fiber,
            productInfo.nutriscore_grade, productInfo.ecoscore_grade, barcode
          ]
        );
        console.log('Product details updated for existing barcode:', barcode);
        return { 
          success: false, 
          existing: true, 
          scannedAt: existing.scanned_at,
          productInfo: productInfo
        };
      }
      
      return { 
        success: false, 
        existing: true, 
        scannedAt: existing.scanned_at,
        productInfo: existing.product_name ? existing : null
      };
    }
    
    await db.runAsync(
      `INSERT INTO scanned_items (
        barcode, scanned_at, product_name, brand, image_url, quantity,
        categories, allergens, labels, energy_kcal, proteins, fat,
        carbohydrates, sugars, saturated_fat, salt, fiber, nutriscore_grade, ecoscore_grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        barcode, scannedAt, productInfo?.product_name || null, productInfo?.brand || null,
        productInfo?.image_url || null, productInfo?.quantity || null, productInfo?.categories || null,
        productInfo?.allergens || null, productInfo?.labels || null, productInfo?.energy_kcal || null,
        productInfo?.proteins || null, productInfo?.fat || null, productInfo?.carbohydrates || null,
        productInfo?.sugars || null, productInfo?.saturated_fat || null, productInfo?.salt || null,
        productInfo?.fiber || null, productInfo?.nutriscore_grade || null, productInfo?.ecoscore_grade || null
      ]
    );
    console.log('Insert successful, barcode:', barcode);
    
    return { success: true, scannedAt, productInfo };
  } catch (error) {
    console.log('Error in insertBarcodeWithProductDetails:', error.message);
    db = null;
    await initDatabase();
    
    const productInfo = await fetchProductDetails(barcode);
    
    const existing = await db.getFirstAsync(
      'SELECT * FROM scanned_items WHERE barcode = ?',
      [barcode]
    );
    
    if (existing) {
      if (!existing.product_name && productInfo) {
        await db.runAsync(
          `UPDATE scanned_items SET 
            product_name = ?, brand = ?, image_url = ?, quantity = ?, 
            categories = ?, allergens = ?, labels = ?, energy_kcal = ?,
            proteins = ?, fat = ?, carbohydrates = ?, sugars = ?,
            saturated_fat = ?, salt = ?, fiber = ?, nutriscore_grade = ?, ecoscore_grade = ?
          WHERE barcode = ?`,
          [
            productInfo.product_name, productInfo.brand, productInfo.image_url,
            productInfo.quantity, productInfo.categories, productInfo.allergens,
            productInfo.labels, productInfo.energy_kcal, productInfo.proteins,
            productInfo.fat, productInfo.carbohydrates, productInfo.sugars,
            productInfo.saturated_fat, productInfo.salt, productInfo.fiber,
            productInfo.nutriscore_grade, productInfo.ecoscore_grade, barcode
          ]
        );
        return { 
          success: false, 
          existing: true, 
          scannedAt: existing.scanned_at,
          productInfo: productInfo
        };
      }
      
      return { 
        success: false, 
        existing: true, 
        scannedAt: existing.scanned_at,
        productInfo: existing.product_name ? existing : null
      };
    }
    
    await db.runAsync(
      `INSERT INTO scanned_items (
        barcode, scanned_at, product_name, brand, image_url, quantity,
        categories, allergens, labels, energy_kcal, proteins, fat,
        carbohydrates, sugars, saturated_fat, salt, fiber, nutriscore_grade, ecoscore_grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        barcode, scannedAt, productInfo?.product_name || null, productInfo?.brand || null,
        productInfo?.image_url || null, productInfo?.quantity || null, productInfo?.categories || null,
        productInfo?.allergens || null, productInfo?.labels || null, productInfo?.energy_kcal || null,
        productInfo?.proteins || null, productInfo?.fat || null, productInfo?.carbohydrates || null,
        productInfo?.sugars || null, productInfo?.saturated_fat || null, productInfo?.salt || null,
        productInfo?.fiber || null, productInfo?.nutriscore_grade || null, productInfo?.ecoscore_grade || null
      ]
    );
    
    return { success: true, scannedAt, productInfo };
  }
};

export const getAllBarcodes = async () => {
  console.log('getAllBarcodes called, db is:', db ? 'defined' : 'null');
  if (!db) {
    console.log('Initializing db in getAllBarcodes');
    await initDatabase();
  }
  
  try {
    console.log('Querying database...');
    const items = await db.getAllAsync(
      'SELECT * FROM scanned_items ORDER BY scanned_at DESC'
    );
    console.log('Got items:', items.length, items);
    return items;
  } catch (error) {
    console.log('Error in getAllBarcodes, reinitializing db...');
    db = null;
    await initDatabase();
    const items = await db.getAllAsync(
      'SELECT * FROM scanned_items ORDER BY scanned_at DESC'
    );
    return items;
  }
};

export const refreshProductDetails = async (barcode) => {
  if (!db) {
    await initDatabase();
  }
  try {
    const productInfo = await fetchProductDetails(barcode);
    if (productInfo && db) {
      await db.runAsync(
        'UPDATE scanned_items SET product_name = ?, brand = ?, image_url = ? WHERE barcode = ?',
        [productInfo.product_name, productInfo.brand, productInfo.image_url, barcode]
      );
    }
    return productInfo;
  } catch (error) {
    console.log('Error in refreshProductDetails, reinitializing db...');
    db = null;
    await initDatabase();
    const productInfo = await fetchProductDetails(barcode);
    if (productInfo && db) {
      await db.runAsync(
        'UPDATE scanned_items SET product_name = ?, brand = ?, image_url = ? WHERE barcode = ?',
        [productInfo.product_name, productInfo.brand, productInfo.image_url, barcode]
      );
    }
    return productInfo;
  }
};

export const deleteBarcode = async (barcode) => {
  if (!db) {
    await initDatabase();
  }
  try {
    await db.runAsync('DELETE FROM scanned_items WHERE barcode = ?', [barcode]);
  } catch (error) {
    console.log('Error in deleteBarcode, reinitializing db...');
    db = null;
    await initDatabase();
    await db.runAsync('DELETE FROM scanned_items WHERE barcode = ?', [barcode]);
  }
};
