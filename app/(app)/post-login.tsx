import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function PostLoginScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/entry');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Logged in successfully</Text>
      <Text style={styles.subtext}>Dashboard placeholder</Text>
      
      <Button title="Logout" onPress={handleLogout} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 24,
    fontWeight: FONTS.weight.bold,
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 32,
  },
  button: {
    width: 200,
  }
});
