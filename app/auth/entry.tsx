import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Globe } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { COLORS, SPACING, FONTS, RADIUS } from '../../src/theme';
import { authService } from '../../src/services/auth.service';

// Schemas
const emailSchema = z.object({
  identifier: z.string().email({ message: "Invalid email address" }),
});

const phoneSchema = z.object({
  identifier: z.string().min(8, { message: "Phone number too short" }),
});

export default function AuthEntryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [loading, setLoading] = useState(false);
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(method === 'email' ? emailSchema : phoneSchema),
    defaultValues: { identifier: '' }
  });

  const toggleLanguage = () => {
    // 1. Show loader immediately to cover the reload process
    setIsSwitchingLanguage(true);

    // 2. Small timeout to ensure the loader renders before the heavy reload starts
    setTimeout(() => {
      const nextLang = i18n.language === 'en' ? 'ar' : 'en';
      i18n.changeLanguage(nextLang);
      // The app will reload via the listener in i18n/index.ts
    }, 50);
  };

  const onSubmit = async (data: { identifier: string }) => {
    setLoading(true);
    try {
      const exists = await authService.checkUserExists(data.identifier, method);
      
      if (exists) {
        router.push({
          pathname: '/auth/password',
          params: { identifier: data.identifier, type: method }
        });
      } else {
        // User doesn't exist -> Send OTP -> Register
        const res = await authService.sendOtp(data.identifier, method);
        if (res.success) {
          router.push({
            pathname: '/auth/otp',
            params: { identifier: data.identifier, type: method, context: 'register' }
          });
        } else {
          alert(res.error || 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Safe language display with fallback
  const currentLang = i18n.language || 'en';

  // Show full screen loader during language switch
  if (isSwitchingLanguage) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          {currentLang === 'en' ? 'Switching to Arabic...' : 'Switching to English...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Globe size={20} color={COLORS.text.secondary} />
          <Text style={styles.langText}>{currentLang.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>{t('signInSubtitle')}</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, method === 'phone' && styles.toggleBtnActive]}
            onPress={() => setMethod('phone')}
          >
            <Text style={[styles.toggleText, method === 'phone' && styles.toggleTextActive]}>{t('phone')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, method === 'email' && styles.toggleBtnActive]}
            onPress={() => setMethod('email')}
          >
            <Text style={[styles.toggleText, method === 'email' && styles.toggleTextActive]}>{t('email')}</Text>
          </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder={method === 'email' ? t('emailPlaceholder') : t('phonePlaceholder')}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.identifier?.message as string}
              leftIcon={method === 'email' ? <Mail size={20} color={COLORS.text.tertiary} /> : <Phone size={20} color={COLORS.text.tertiary} />}
              keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
            />
          )}
        />

        <Button 
          title={t('continue')} 
          onPress={handleSubmit(onSubmit)} 
          loading={loading}
          style={styles.mainButton}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t('or')}</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <Button 
            title={t('google')} 
            variant="outline" 
            style={styles.socialBtn} 
            textStyle={{ color: COLORS.text.primary, fontSize: 14 }}
            icon={<FontAwesome name="google" size={18} color={COLORS.social.google} />}
            onPress={() => {}} 
          />
          <Button 
            title={t('facebook')} 
            variant="outline" 
            style={styles.socialBtn}
            textStyle={{ color: COLORS.text.primary, fontSize: 14 }}
            icon={<FontAwesome name="facebook" size={18} color={COLORS.social.facebook} />}
            onPress={() => {}} 
          />
          <Button 
            title={t('apple')} 
            variant="outline" 
            style={styles.socialBtn}
            textStyle={{ color: COLORS.text.primary, fontSize: 14 }}
            icon={<FontAwesome name="apple" size={18} color={COLORS.social.apple} />}
            onPress={() => {}} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: FONTS.weight.medium,
  },
  header: {
    padding: SPACING.m,
    alignItems: 'flex-end',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  langText: {
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  content: {
    flex: 1,
    padding: SPACING.l,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.m,
    padding: 4,
    marginBottom: SPACING.l,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.s,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    color: COLORS.text.secondary,
    fontWeight: FONTS.weight.medium,
  },
  toggleTextActive: {
    color: COLORS.text.primary,
    fontWeight: FONTS.weight.bold,
  },
  mainButton: {
    marginTop: SPACING.s,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    paddingHorizontal: SPACING.m,
    color: COLORS.text.tertiary,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: SPACING.s, // Reduced gap to fit 3 buttons
  },
  socialBtn: {
    flex: 1,
    paddingHorizontal: 0, // Reduce padding to fit text
  },
});
