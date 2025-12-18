import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import i18n from '../src/i18n'; // Initialize i18n configuration

export default function RootLayout() {
  useFrameworkReady();
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        if (!i18n.isInitialized) {
          // Wait for initialization with a safety timeout (2 seconds max)
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 2000);
            i18n.on('initialized', () => {
              clearTimeout(timeout);
              resolve();
            });
          });
        }
      } catch (error) {
        console.warn('i18n initialization warning:', error);
      } finally {
        // Always set to true so the app doesn't get stuck on white screen
        setIsI18nInitialized(true);
      }
    };

    initI18n();
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
