import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';

import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { COLORS, SPACING, FONTS, RADIUS } from '../../src/theme';
import { authService } from '../../src/services/auth.service';

const registerSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  password: z.string()
    .min(8, "Min 8 chars")
    .regex(/[0-9]/, "Needs a number")
    .regex(/[^a-zA-Z0-9]/, "Needs special char"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const identifier = params.identifier as string;
  const type = params.type as 'email' | 'phone';
  
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        email: type === 'email' ? identifier : undefined,
        phone: type === 'phone' ? identifier : undefined,
        userType: 'tenant', // Defaulting
      });

      if (res.success) {
        // Success -> Go back to entry to login
        alert('Account created! Please login.');
        router.dismissAll();
        router.replace('/auth/entry');
      } else {
        alert(res.error || 'Registration failed');
      }
    } catch (e) {
      alert('Error creating account');
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('createAccount')}</Text>
        
        <View style={styles.verifiedBadge}>
          <CheckCircle2 size={16} color={COLORS.text.success} />
          <Text style={styles.verifiedText}>{identifier}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('firstName')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.firstName?.message as string}
                />
              )}
            />
          </View>
          <View style={styles.halfInput}>
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('lastName')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.lastName?.message as string}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('passwordPlaceholder')}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message as string}
            />
          )}
        />

        <View style={styles.rulesBox}>
          <Text style={styles.rulesText}>{t('passwordRules')}</Text>
        </View>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('confirmPasswordPlaceholder')}
              isPassword
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message as string}
            />
          )}
        />

        <Button 
          title={t('createAccount')} 
          onPress={handleSubmit(onSubmit)} 
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
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
    padding: SPACING.l,
  },
  title: {
    fontSize: 28,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    padding: SPACING.s,
    borderRadius: RADIUS.s,
    alignSelf: 'flex-start',
    marginBottom: SPACING.l,
    gap: 8,
  },
  verifiedText: {
    color: COLORS.text.secondary,
    fontWeight: FONTS.weight.medium,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  halfInput: {
    flex: 1,
  },
  rulesBox: {
    backgroundColor: COLORS.surfaceHighlight,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginBottom: SPACING.m,
  },
  rulesText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  button: {
    marginTop: SPACING.m,
  },
});
