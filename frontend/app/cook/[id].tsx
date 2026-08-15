import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";

function useKeepAwakeSafe() {
  // expo-keep-awake uses the browser Wake Lock API on web which requires
  // user gesture + secure context and throws in many previews. Only enable on native.
  if (Platform.OS === "web") return;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useKeepAwake();
}

import { theme } from "@/src/theme";
import { ALL_RECIPES, Recipe } from "@/src/data/recipes";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CookMode() {
  useKeepAwakeSafe();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe: Recipe | undefined = ALL_RECIPES.find((r) => r.id === id);

  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.notFound}>Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  const total = recipe.instructions.length;
  const isLast = step === total - 1;
  const progress = ((step + 1) / total) * 100;

  const go = (dir: 1 | -1) => {
    Haptics.selectionAsync().catch(() => {});
    setStep((s) => Math.min(Math.max(s + dir, 0), total - 1));
  };

  const adjust = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSeconds((s) => Math.max(0, s + delta));
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRunning((r) => !r);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRunning(false);
    setSeconds(5 * 60);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.top}>
        <Pressable testID="cook-close" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={theme.colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.recipeName} numberOfLines={1}>
            {recipe.name}
          </Text>
          <Text style={styles.stepCount}>
            Step {step + 1} of {total}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <View style={styles.stepArea}>
        <Text style={styles.stepBig}>{recipe.instructions[step]}</Text>
      </View>

      {/* Timer */}
      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>STEP TIMER</Text>
        <Text testID="cook-timer" style={styles.timer}>
          {fmt(seconds)}
        </Text>
        <View style={styles.timerControls}>
          <Pressable testID="cook-timer-minus" onPress={() => adjust(-60)} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>−1m</Text>
          </Pressable>
          <Pressable testID="cook-timer-toggle" onPress={toggleTimer} style={styles.playBtn}>
            <Ionicons name={running ? "pause" : "play"} size={26} color={theme.colors.onBrand} />
          </Pressable>
          <Pressable testID="cook-timer-plus" onPress={() => adjust(60)} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>+1m</Text>
          </Pressable>
        </View>
        <Pressable testID="cook-timer-reset" onPress={resetTimer} style={styles.resetBtn}>
          <Ionicons name="refresh" size={13} color={theme.colors.onSurfaceMuted} />
          <Text style={styles.resetText}>Reset to 5:00</Text>
        </Pressable>
      </View>

      {/* Navigation */}
      <View style={styles.nav}>
        <Pressable
          testID="cook-prev"
          onPress={() => go(-1)}
          disabled={step === 0}
          style={[styles.navBtn, step === 0 && { opacity: 0.4 }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
          <Text style={styles.navText}>Prev</Text>
        </Pressable>
        {isLast ? (
          <Pressable testID="cook-finish" onPress={() => router.back()} style={styles.finishBtn}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.onBrand} />
            <Text style={styles.finishText}>Finish</Text>
          </Pressable>
        ) : (
          <Pressable testID="cook-next" onPress={() => go(1)} style={styles.nextBtn}>
            <Text style={styles.nextText}>Next step</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.colors.onBrand} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  notFound: { color: theme.colors.onSurface, fontFamily: "Geist", padding: 24 },
  top: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeName: { fontFamily: "FrauncesBold", fontSize: 18, color: theme.colors.onSurface, letterSpacing: -0.3 },
  stepCount: { fontFamily: "GeistMedium", fontSize: 12, color: theme.colors.brand, marginTop: 2, letterSpacing: 0.6 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface4,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: theme.colors.brand },
  stepArea: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  stepBig: {
    fontFamily: "FrauncesBold",
    fontSize: 30,
    lineHeight: 40,
    color: theme.colors.onSurface,
    letterSpacing: -0.5,
  },
  timerCard: {
    marginHorizontal: 20,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    alignItems: "center",
  },
  timerLabel: {
    fontFamily: "GeistBold",
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.onSurfaceFaint,
  },
  timer: {
    fontFamily: "FrauncesBold",
    fontSize: 56,
    color: theme.colors.onSurface,
    letterSpacing: -1,
    marginVertical: 6,
    fontVariant: ["tabular-nums"],
  },
  timerControls: { flexDirection: "row", alignItems: "center", gap: 20 },
  smallBtn: {
    width: 56,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { fontFamily: "GeistBold", fontSize: 14, color: theme.colors.onSurface },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  resetText: { fontFamily: "GeistMedium", fontSize: 12, color: theme.colors.onSurfaceMuted },
  nav: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    height: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface2,
  },
  navText: { fontFamily: "GeistMedium", fontSize: 15, color: theme.colors.onSurface },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand,
  },
  nextText: { fontFamily: "GeistBold", fontSize: 15, color: theme.colors.onBrand },
  finishBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.success,
  },
  finishText: { fontFamily: "GeistBold", fontSize: 15, color: theme.colors.onBrand },
});
