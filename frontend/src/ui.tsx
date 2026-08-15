import { View, Text, StyleSheet, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "./theme";

export const RUCHIO_TAGLINE = "Smart Kitchen Companion";

export function Wordmark({ size = 44, tone = "brand" as "brand" | "light" }) {
  const color = tone === "brand" ? theme.colors.brand : theme.colors.onSurface;
  return (
    <Text
      testID="ruchio-wordmark"
      style={{
        fontFamily: "FrauncesBold",
        fontSize: size,
        letterSpacing: -1.6,
        color,
        lineHeight: size * 1.05,
      }}
    >
      Ruchio
      <Text style={{ color: theme.colors.brand }}>.</Text>
    </Text>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  testID,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.4 },
      ]}
    >
      {icon}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  testID,
  icon,
}: {
  label: string;
  onPress?: () => void;
  testID?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.7 }]}
    >
      {icon}
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.glassWrap, style]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.glassBg} />
      <View style={{ padding: theme.spacing.lg }}>{children}</View>
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipSelected: {
    backgroundColor: theme.colors.brand,
    borderColor: theme.colors.brand,
  },
  chipText: {
    fontFamily: "GeistMedium",
    fontSize: 13,
    color: theme.colors.onSurfaceMuted,
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: theme.colors.onBrand,
  },
  primaryBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand,
    paddingHorizontal: 20,
    shadowColor: theme.colors.brand,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  primaryBtnText: {
    fontFamily: "GeistBold",
    fontSize: 15,
    color: theme.colors.onBrand,
    letterSpacing: 0.3,
  },
  ghostBtn: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface2,
  },
  ghostBtnText: {
    fontFamily: "GeistMedium",
    fontSize: 15,
    color: theme.colors.onSurface,
    letterSpacing: 0.3,
  },
  glassWrap: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  glassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(23,23,23,0.75)",
  },
  sectionLabel: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 8,
  },
});
