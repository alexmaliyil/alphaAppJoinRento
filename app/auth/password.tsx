import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { COLORS, SPACING, FONTS } from '../../src/theme';
import { authService } from '../../src/services/auth.service';

export default function PasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const identifier = params.identifier as string;
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!password) {
      setError(t('errors.required'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authService.login(identifier, password);
      if (res.success) {
        router.replace('/(app)/post-login');
      } else {
        setError(res.error || t('errors.generic'));
      }
    } catch (e) {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Enter your password to continue as{"\n"}{identifier}</Text>

        <Input
          label={t('passwordPlaceholder')}
          isPassword
          value={password}
          onChangeText={setPassword}
          error={error}
          autoFocus
        />

        <View style={styles.forgotContainer}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/auth/forgot-password', params: { identifier }})}>
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>
        </View>

        <Button 
          title={t('login')} 
          onPress={handleLogin} 
          loading={loading}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.m,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: SPACING.l,
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.l,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.medium,
  },
  button: {
    marginTop: SPACING.s,
  },
});
