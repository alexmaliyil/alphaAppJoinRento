import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.surfaceHighlight;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.text.tertiary;
    switch (variant) {
      case 'primary': return COLORS.text.inverse;
      case 'secondary': return COLORS.text.primary;
      case 'outline': return COLORS.primary;
      case 'ghost': return COLORS.text.secondary;
      default: return COLORS.text.inverse;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return disabled ? COLORS.border : COLORS.primary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && icon}
          <Text 
            style={[
              styles.text, 
              { color: getTextColor() }, 
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: RADIUS.m,
    flexDirection: 'row', // Automatically flips in RTL
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.m,
    gap: 8, // Modern spacing that works in both LTR and RTL
  },
  text: {
    fontSize: 16,
    fontWeight: FONTS.weight.medium,
  },
});
