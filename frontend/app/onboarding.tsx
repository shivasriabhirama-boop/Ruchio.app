import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/src/theme";
import { storage } from "@/src/storage";
import { ALL_INGREDIENTS } from "@/src/data/recipes";
import { Wordmark, Chip, PrimaryButton, GhostButton, SectionLabel } from "@/src/ui";

const HABITS = ["Non-Veg", "Veg", "Vegan", "Jain"] as const;
const QUIZ_OPTIONS = [
  "One-Pot Chicken Rice",
  "Classic Boiled Eggs",
  "Homestyle Scrambled Eggs",
  "Pan-Seared Chicken",
  "Spiced Paneer Bhurji",
];

const WELCOME_IMG =
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("25");
  const [habits, setHabits] = useState<(typeof HABITS)[number]>("Non-Veg");
  const [avoid, setAvoid] = useState<string[]>([]);
  const [quizPref, setQuizPref] = useState(QUIZ_OPTIONS[0]);

  const canProceed =
    step === 0 ? true : step === 1 ? name.trim().length >= 2 && Number(age) > 0 : true;

  const next = () => {
    Haptics.selectionAsync().catch(() => {});
    if (step < 3) setStep(((step as number) + 1) as 0 | 1 | 2 | 3);
    else finish();
  };
  const back = () => {
    if (step > 0) setStep(((step as number) - 1) as 0 | 1 | 2 | 3);
  };

  const finish = async () => {
    await storage.setProfile({
      name: name.trim() || "Friend",
      age: Number(age) || 25,
      habits,
      avoid,
      quizPref,
      onboarded: true,
    });
    router.replace("/(tabs)");
  };

  const toggleAvoid = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAvoid((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Wordmark size={34} />
          <View style={styles.stepRow}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.dot, i <= step && { backgroundColor: theme.colors.brand, width: 22 }]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <View testID="onboarding-step-welcome">
              <View style={styles.welcomeImgWrap}>
                <Image source={WELCOME_IMG} style={styles.welcomeImg} contentFit="cover" transition={300} />
              </View>
              <SectionLabel>Welcome</SectionLabel>
              <Text style={styles.h1}>
                A kitchen{"\n"}
                <Text style={styles.h1Accent}>tuned to you.</Text>
              </Text>
              <Text style={styles.body}>
                Ruchio matches recipes to what’s actually in your pantry — no grocery run
                required. Answer four quick questions and we’ll set the table.
              </Text>
            </View>
          )}

          {step === 1 && (
            <View testID="onboarding-step-basics">
              <SectionLabel>About you</SectionLabel>
              <Text style={styles.h2}>Let’s get{"\n"}acquainted.</Text>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                testID="onboarding-name-input"
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Aarav"
                placeholderTextColor={theme.colors.onSurfaceFaint}
                autoCapitalize="words"
              />
              <Text style={[styles.label, { marginTop: 20 }]}>Your age</Text>
              <TextInput
                testID="onboarding-age-input"
                style={styles.input}
                value={age}
                onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
                placeholder="25"
                placeholderTextColor={theme.colors.onSurfaceFaint}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.label, { marginTop: 20 }]}>Eating style</Text>
              <View style={styles.pillRow}>
                {HABITS.map((h) => (
                  <Chip
                    key={h}
                    testID={`onboarding-habit-${h}`}
                    label={h}
                    selected={habits === h}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setHabits(h);
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View testID="onboarding-step-avoid">
              <SectionLabel>Personalise</SectionLabel>
              <Text style={styles.h2}>Anything to{"\n"}steer clear of?</Text>
              <Text style={styles.body}>
                Tap ingredients we should keep out of every recommendation.
              </Text>
              <View style={[styles.pillRow, { marginTop: 20 }]}>
                {ALL_INGREDIENTS.map((i) => (
                  <Chip
                    key={i}
                    testID={`onboarding-avoid-${i}`}
                    label={i}
                    selected={avoid.includes(i)}
                    onPress={() => toggleAvoid(i)}
                  />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View testID="onboarding-step-quiz">
              <SectionLabel>Quick quiz</SectionLabel>
              <Text style={styles.h2}>What do you{"\n"}crave right now?</Text>
              <View style={{ marginTop: 20, gap: 10 }}>
                {QUIZ_OPTIONS.map((opt) => {
                  const selected = quizPref === opt;
                  return (
                    <Pressable
                      key={opt}
                      testID={`onboarding-quiz-${opt}`}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setQuizPref(opt);
                      }}
                      style={[styles.quizRow, selected && styles.quizRowSelected]}
                    >
                      <Text
                        style={[
                          styles.quizText,
                          selected && { color: theme.colors.onBrand, fontFamily: "GeistBold" },
                        ]}
                      >
                        {opt}
                      </Text>
                      {selected && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.onBrand} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <GhostButton
              testID="onboarding-back"
              label="Back"
              onPress={back}
              icon={<Ionicons name="arrow-back" size={18} color={theme.colors.onSurface} />}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <View style={{ flex: 1 }}>
            <PrimaryButton
              testID="onboarding-next"
              label={step === 3 ? "Enter the kitchen" : step === 0 ? "Get started" : "Continue"}
              onPress={next}
              disabled={!canProceed}
              icon={
                step === 3 ? (
                  <Ionicons name="sparkles" size={18} color={theme.colors.onBrand} />
                ) : (
                  <Ionicons name="arrow-forward" size={18} color={theme.colors.onBrand} />
                )
              }
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepRow: { flexDirection: "row", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.borderStrong },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 },
  welcomeImgWrap: {
    height: 200,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  welcomeImg: { width: "100%", height: "100%" },
  h1: {
    fontFamily: "FrauncesBold",
    fontSize: 46,
    lineHeight: 50,
    color: theme.colors.onSurface,
    letterSpacing: -1.5,
    marginBottom: 18,
  },
  h1Accent: { fontFamily: "FrauncesItalic", color: theme.colors.brand },
  h2: {
    fontFamily: "FrauncesBold",
    fontSize: 36,
    lineHeight: 40,
    color: theme.colors.onSurface,
    letterSpacing: -1.2,
    marginBottom: 18,
  },
  body: { fontFamily: "Geist", fontSize: 16, lineHeight: 24, color: theme.colors.onSurfaceMuted },
  label: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceFaint,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  input: {
    height: 54,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    fontFamily: "Geist",
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  quizRow: {
    minHeight: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quizRowSelected: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  quizText: { fontFamily: "GeistMedium", fontSize: 15, color: theme.colors.onSurface },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
});
