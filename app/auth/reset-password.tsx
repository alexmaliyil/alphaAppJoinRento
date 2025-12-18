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

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirm) {
      alert(t('errors.required'));
      return;
    }
    
    if (password !== confirm) {
      alert(t('errors.passwordMatch'));
      return;
    }

    // Basic length check
    if (password.length < 8) {
      alert(t('errors.passwordShort'));
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(password);
      
      if (res.success) {
        alert('Password reset successful! Please login with your new password.');
        router.dismissAll();
        router.replace('/auth/entry');
      } else {
        alert(res.error || t('errors.generic'));
      }
    } catch (e) {
      alert(t('errors.generic'));
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create a new strong password.</Text>

        <Input
          label={t('passwordPlaceholder')}
          isPassword
          value={password}
          onChangeText={setPassword}
        />

        <Input
          label={t('confirmPasswordPlaceholder')}
          isPassword
          value={confirm}
          onChangeText={setConfirm}
        />

        <Button 
          title="Reset Password"
          onPress={handleReset} 
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
