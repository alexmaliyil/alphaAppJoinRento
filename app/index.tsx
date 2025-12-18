import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { COLORS, FONTS } from '../src/theme';
import { supabase } from '../src/lib/supabase';
import { USE_SUPABASE } from '../src/config';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Minimum splash duration for branding (2 seconds)
        const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
        
        // Session check logic
        const sessionCheck = async () => {
          if (!USE_SUPABASE) return { hasSession: false, hasProfile: false };
          
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) return { hasSession: false, hasProfile: false };

          // Check if profile exists (meaning registration is fully complete)
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          return { hasSession: true, hasProfile: !!data };
        };

        // Safety timeout: if Supabase hangs, fail after 5 seconds
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );

        // Run delay and session check in parallel
        // We catch errors in sessionCheck to ensure we don't crash
        const [_, result] = await Promise.all([
          minDelay,
          Promise.race([sessionCheck(), timeout]).catch((e) => {
            console.warn('Splash loading error:', e);
            return { hasSession: false, hasProfile: false };
          })
        ]);

        if (result.hasSession && result.hasProfile) {
          // Use the direct route path, avoiding group syntax if possible
          router.replace('/post-login');
        } else {
          router.replace('/auth/entry');
        }
      } catch (e) {
        // Fallback safety: always go to auth entry if something catastrophic happens
        console.error('Splash screen error:', e);
        router.replace('/auth/entry');
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 1000 }}
        style={styles.logoContainer}
      >
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.brandName}>Rento</Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  brandName: {
    fontSize: 24,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
});
