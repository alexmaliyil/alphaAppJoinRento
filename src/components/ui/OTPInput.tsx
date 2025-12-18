import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../../theme';

interface OTPInputProps {
  length?: number;
  onCodeChanged: (code: string) => void;
  error?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 4, onCodeChanged, error }) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    onCodeChanged(code.join(''));
  }, [code]);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          style={[
            styles.input,
            { borderColor: error ? COLORS.text.error : digit ? COLORS.primary : COLORS.border },
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          autoFocus={index === 0}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.l,
  },
  input: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderRadius: RADIUS.m,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: FONTS.weight.bold,
    backgroundColor: COLORS.surface,
    color: COLORS.text.primary,
  },
});
