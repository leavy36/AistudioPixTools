import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import theme from "@/constants/colors";

const serifFont = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" });

export function ScreenTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.screenTitle}>{children}</Text>;
}

export function MutedText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}

export function Chip({ label, active, onPress, testID }: ChipProps) {
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress();
      }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  testID?: string;
  variant?: "solid" | "ghost";
  icon?: React.ReactNode;
}

export function GradientButton({ label, onPress, disabled, busy, testID, variant = "solid", icon }: GradientButtonProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled || busy}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        onPress();
      }}
      style={({ pressed }) => [
        variant === "ghost" ? styles.ghost : styles.gradientWrap,
        (disabled || busy) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {variant === "ghost" ? (
        <View style={styles.ghostInner}>
          {icon}
          {busy ? <ActivityIndicator color={theme.accent2} size="small" /> : <Text style={styles.ghostText}>{label}</Text>}
        </View>
      ) : (
        <LinearGradient
          colors={[theme.accent, theme.accent2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {busy ? (
            <ActivityIndicator color={theme.white} size="small" />
          ) : (
            <Text style={styles.gradientText}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

export function GhostButton({ label, onPress, disabled, testID }: GhostButtonProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.ghost, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}

export function NumberField({ label, value, onChange, testID }: NumberFieldProps) {
  return (
    <View style={styles.numberField}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        testID={testID}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        placeholderTextColor={theme.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    color: theme.ink,
    marginBottom: 4,
  },
  muted: {
    color: theme.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  fieldLabel: {
    color: theme.muted,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.line,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent2,
  },
  chipText: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "500" as const,
  },
  chipTextActive: {
    color: theme.white,
    fontWeight: "700" as const,
  },
  gradientWrap: {
    borderRadius: 12,
    overflow: "hidden" as const,
    shadowColor: theme.accent2,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 48,
  },
  gradientText: {
    color: theme.white,
    fontWeight: "700" as const,
    fontSize: 15,
  },
  ghost: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center" as const,
    backgroundColor: theme.panel,
    minHeight: 48,
    justifyContent: "center" as const,
  },
  ghostInner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  ghostText: {
    color: theme.ink,
    fontWeight: "600" as const,
    fontSize: 14,
  },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  numberField: {
    flex: 1,
    minWidth: 100,
  },
  input: {
    backgroundColor: theme.bg2,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.ink,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
