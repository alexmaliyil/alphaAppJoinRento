import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

import { Button } from '../../src/components/ui/Button';
import { OTPInput } from '../../src/components/ui/OTPInput';
import { COLORS, SPACING, FONTS } from '../../src/theme';
import { authService } from '../../src/services/auth.service';

export default function OTPScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const identifier = params.identifier as string;
  const type = params.type as 'email' | 'phone';
  const context = params.context as 'register' | 'forgot-password';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 4) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const res = await authService.verifyOtp(identifier, code, type);
      if (res.success) {
        if (context === 'register') {
          router.push({
            pathname: '/auth/register',
            params: { identifier, type }
          });
        } else {
          router.push({
            pathname: '/auth/reset-password',
            params: { identifier, token: code } // Passing token for reset flow
          });
        }
      } else {
        setError(true);
        alert(res.error || 'Invalid Code');
      }
    } catch (e) {
      setError(true);
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
        <Text style={styles.title}>Verification</Text>
        <Text style={styles.subtitle}>
          {t('codeSentTo', { identifier })}
        </Text>

        <OTPInput 
          length={4} 
          onCodeChanged={setCode} 
          error={error}
        />

        <Button 
          title={t('verifyCode')} 
          onPress={handleVerify} 
          loading={loading}
          disabled={code.length !== 4}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={() => authService.sendOtp(identifier, type)}>
            <Text style={styles.resendLink}>{t('resendCode')}</Text>
          </TouchableOpacity>
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
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.l,
  },
  resendText: {
    color: COLORS.text.secondary,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
});
