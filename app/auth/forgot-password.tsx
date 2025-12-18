import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { COLORS, SPACING, FONTS } from '../../src/theme';
import { authService } from '../../src/services/auth.service';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!identifier) return;
    setLoading(true);
    try {
      // Simple heuristic for type
      const type = identifier.includes('@') ? 'email' : 'phone';
      const res = await authService.sendOtp(identifier, type);
      
      if (res.success) {
        router.push({
          pathname: '/auth/otp',
          params: { identifier, type, context: 'forgot-password' }
        });
      } else {
        alert(res.error || 'Failed to send code');
      }
    } catch (e) {
      alert('Error');
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email or phone to reset your password.</Text>

        <Input
          label="Email or Phone"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <Button 
          title={t('sendCode')} 
          onPress={handleSend} 
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
  },
  button: {
    marginTop: SPACING.s,
  },
});
