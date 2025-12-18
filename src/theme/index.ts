import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#9333EA', // Purple
  primaryDark: '#7928CA',
  primaryLight: '#A855F7',
  
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceHighlight: '#F3F4F6',
  
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    error: '#EF4444',
    success: '#10B981',
  },
  
  border: '#E5E7EB',
  borderFocus: '#9333EA',
  
  social: {
    google: '#DB4437',
    facebook: '#4267B2',
    apple: '#000000',
  }
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  full: 9999,
};

export const FONTS = {
  // Assuming default system fonts for now, can be replaced with custom fonts
  regular: 'System',
  medium: 'System',
  bold: 'System',
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  }
};

export const LAYOUT = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
};
