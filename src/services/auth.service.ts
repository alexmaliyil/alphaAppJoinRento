import { USE_SUPABASE } from '../config';
import { supabase } from '../lib/supabase';

// Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  user_type?: 'landlord' | 'tenant';
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  session?: any;
}

class AuthService {
  /**
   * Check if a user exists by email or phone.
   * Uses a secure RPC function to avoid exposing the profiles table.
   */
  async checkUserExists(identifier: string, type: 'email' | 'phone'): Promise<boolean> {
    if (USE_SUPABASE) {
      // 1. Try Secure RPC first
      const { data, error } = await supabase.rpc('check_user_exists', {
        identifier_input: identifier,
        type_input: type
      });

      if (!error && data !== null) {
        return data;
      }

      // 2. Fallback: Direct query (only works if RLS allows anon select)
      // Useful for dev/testing if RPC migration isn't run yet
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq(type, identifier)
        .single();
      
      return !!profile;
    } else {
      // Mock for Laravel
      console.log(`[Mock API] Checking if user exists: ${identifier}`);
      await new Promise(r => setTimeout(r, 800)); // Simulate network
      return identifier.includes('exist');
    }
  }

  /**
   * Send OTP to email or phone.
   */
  async sendOtp(identifier: string, type: 'email' | 'phone'): Promise<AuthResponse> {
    if (USE_SUPABASE) {
      // Supabase handles OTP via signInWithOtp
      const { error } = await supabase.auth.signInWithOtp({
        [type]: identifier,
      });
      
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      console.log(`[Mock API] Sending OTP to ${identifier}`);
      await new Promise(r => setTimeout(r, 1000));
      return { success: true };
    }
  }

  /**
   * Verify OTP.
   */
  async verifyOtp(identifier: string, token: string, type: 'email' | 'phone'): Promise<AuthResponse> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.auth.verifyOtp({
        [type]: identifier,
        token,
        type: type === 'email' ? 'email' : 'sms',
      });

      if (error) return { success: false, error: error.message };
      return { success: true, session: data.session, user: { id: data.user?.id || '' } };
    } else {
      console.log(`[Mock API] Verifying OTP ${token} for ${identifier}`);
      await new Promise(r => setTimeout(r, 1000));
      if (token === '1234') return { success: true, user: { id: 'mock-id' } };
      return { success: false, error: 'Invalid OTP' };
    }
  }

  /**
   * Login with password.
   */
  async login(identifier: string, password: string): Promise<AuthResponse> {
    if (USE_SUPABASE) {
      // Try to determine if identifier is email or phone (simple check)
      const isEmail = identifier.includes('@');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        password,
      });

      if (error) return { success: false, error: error.message };
      
      // Fetch profile to get user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return { 
        success: true, 
        user: { 
          id: data.user.id, 
          email: data.user.email,
          ...profile 
        } 
      };
    } else {
      console.log(`[Mock API] Login for ${identifier}`);
      await new Promise(r => setTimeout(r, 1000));
      if (password === 'password') {
        return { success: true, user: { id: 'mock-id', user_type: 'tenant' } };
      }
      return { success: false, error: 'Invalid credentials' };
    }
  }

  /**
   * Register new user.
   */
  async register(data: { 
    email?: string; 
    phone?: string; 
    password: string; 
    firstName: string; 
    lastName: string;
    userType?: 'landlord' | 'tenant'
  }): Promise<AuthResponse> {
    if (USE_SUPABASE) {
      // Check if we are already logged in (via OTP verification step)
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;

      if (session) {
        // SCENARIO A: User verified OTP and is logged in.
        // We just need to set their password and metadata.
        const { data: updateData, error: updateError } = await supabase.auth.updateUser({
          password: data.password,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        });

        if (updateError) return { success: false, error: updateError.message };
        userId = updateData.user.id;
      } else {
        // SCENARIO B: User is NOT logged in. Try standard signup.
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          phone: data.phone,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            }
          }
        });

        if (authError) return { success: false, error: authError.message };
        userId = authData.user?.id;
      }

      if (userId) {
        // Create Profile in public table
        // We check existence first to avoid unique constraint errors if retrying
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingProfile) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            email: data.email,
            phone: data.phone,
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType || 'tenant',
          });
          
          if (profileError) console.error('Profile creation failed:', profileError);
        }
      }

      return { success: true, user: { id: userId || '' } };
    } else {
      console.log(`[Mock API] Registering user`);
      await new Promise(r => setTimeout(r, 1500));
      return { success: true };
    }
  }

  /**
   * Reset password for the currently logged-in user.
   * This works because verifyOtp logs the user in, allowing them to update their password.
   */
  async resetPassword(password: string): Promise<AuthResponse> {
    if (USE_SUPABASE) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      console.log(`[Mock API] Resetting password`);
      await new Promise(r => setTimeout(r, 1000));
      return { success: true };
    }
  }
}

export const authService = new AuthService();
