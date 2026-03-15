import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ScannerScreen from './screens/ScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import { initDatabase } from './database/db';

const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Initializing...</Text>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        console.error('Database init error:', err);
        setError(err.message);
      }
    };
    setup();
  }, []);

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Scanner') {
              iconName = focused ? 'scan' : 'scan-outline';
            } else if (route.name === 'History') {
              iconName = focused ? 'list' : 'list-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8e8e93',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen 
          name="Scanner" 
          component={ScannerScreen}
          options={{ title: 'Scan Barcode' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'Scan History' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
