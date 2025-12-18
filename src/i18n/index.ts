import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, NativeModules, Platform } from 'react-native';
import * as Updates from 'expo-updates';

// English Translations
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import errorsEn from './locales/en/errors.json';

// Arabic Translations
import commonAr from './locales/ar/common.json';
import authAr from './locales/ar/auth.json';
import errorsAr from './locales/ar/errors.json';

const resources = {
  en: {
    // We include errors inside common to support legacy t('errors.required') calls
    // while also exposing it as a separate namespace
    common: { ...commonEn, errors: errorsEn },
    auth: authEn,
    errors: errorsEn,
  },
  ar: {
    common: { ...commonAr, errors: errorsAr },
    auth: authAr,
    errors: errorsAr,
  },
};

const LANGUAGE_KEY = 'user-language';

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLanguage) {
        return callback(storedLanguage);
      }
      // Default to English if no preference found
      return callback('en');
    } catch (error) {
      console.warn('Failed to detect language', error);
      callback('en');
    }
  },
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem(LANGUAGE_KEY, lng);
  },
};

/**
 * Handles Web-specific reload logic with a defensive loop guard.
 * Prevents infinite reloading if the build takes longer than expected.
 */
const handleWebReload = (isRTL: boolean) => {
  try {
    const GUARD_KEY = 'rtl_reload_guard_v3';
    const TIMEOUT_MS = 180000; // 3 minutes to account for slow dev builds
    const now = Date.now();
    
    // Defensive read of localStorage
    let lastReload = 0;
    try {
      const stored = localStorage.getItem(GUARD_KEY);
      if (stored) lastReload = parseInt(stored, 10);
    } catch (e) {
      console.warn('LocalStorage access failed, skipping reload to prevent loop.');
      // Fallback: Update HTML dir immediately so UI is usable without reload
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      return;
    }

    // Check if we recently reloaded
    if (now - lastReload < TIMEOUT_MS) {
      console.log('Reload loop detected. Skipping reload.');
      // Fallback: Update HTML dir so UI is usable
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      return;
    }

    // Safe to reload - update guard timestamp
    localStorage.setItem(GUARD_KEY, now.toString());
    window.location.reload();
  } catch (error) {
    console.error('Critical error in web reload logic:', error);
    // Ultimate fallback to ensure usability
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }
};

/**
 * Handles Native (iOS/Android) reload logic.
 */
const handleNativeReload = async () => {
  try {
    // In development, use DevSettings to reload the bundle
    if (__DEV__) {
      if (NativeModules.DevSettings) {
        NativeModules.DevSettings.reload();
      } else {
        console.warn('DevSettings not available');
      }
      return;
    }

    // In production, use Expo Updates
    if (Updates.reloadAsync) {
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Failed to reload app:', error);
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    
    // Namespace configuration
    ns: ['common', 'auth', 'errors'],
    defaultNS: 'common',
    // Fallback to auth/errors if key not found in common
    fallbackNS: ['auth', 'errors'],

    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Important for React Native
    },
    compatibilityJSON: 'v3',
  });

// Handle RTL toggling when language changes
i18n.on('languageChanged', async (lng) => {
  const isRTL = lng === 'ar';
  
  // Only restart if the RTL state actually needs to change
  if (isRTL !== I18nManager.isRTL) {
    await I18nManager.allowRTL(isRTL);
    await I18nManager.forceRTL(isRTL);
    
    if (Platform.OS === 'web') {
      handleWebReload(isRTL);
    } else {
      await handleNativeReload();
    }
  }
});

export default i18n;
