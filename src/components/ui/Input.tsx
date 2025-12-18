import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, I18nManager } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../../theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = I18nManager.isRTL;

  const borderColor = error
    ? COLORS.text.error
    : isFocused
    ? COLORS.borderFocus
    : COLORS.border;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, { borderColor }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input, 
            { 
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: isRTL ? 'rtl' : 'ltr'
            }, 
            style
          ]}
          placeholderTextColor={COLORS.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={COLORS.text.secondary} />
            ) : (
              <Eye size={20} color={COLORS.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontWeight: FONTS.weight.medium,
    textAlign: 'left', // Labels usually follow system direction automatically
  },
  inputContainer: {
    flexDirection: 'row', // Flips automatically in RTL
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.m,
    backgroundColor: COLORS.surface,
    height: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.m,
    color: COLORS.text.primary,
    fontSize: 16,
    height: '100%',
  },
  leftIcon: {
    // Adds space between the start edge (Left in LTR, Right in RTL) and the icon
    paddingStart: SPACING.m,
  },
  rightIcon: {
    paddingHorizontal: SPACING.m,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.text.error,
    marginTop: 4,
    textAlign: 'left',
  },
});
