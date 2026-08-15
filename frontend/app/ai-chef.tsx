import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { storage, Profile, defaultProfile } from "@/src/storage";
import { PrimaryButton, Chip } from "@/src/ui";
import { generateAIRecipe, AIRecipe } from "@/src/api";

const CRAVINGS = ["Comforting", "Spicy", "Quick bite", "Party dish", "Healthy"];

export default function AIChefScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [pantry, setPantry] = useState<string[]>([]);
  const [craving, setCraving] = useState<string>("Comforting");
  const [freeform, setFreeform] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<AIRecipe | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([storage.getProfile(), storage.getPantry()]).then(([p, pt]) => {
        setProfile(p);
        setPantry(pt);
      });
    }, [])
  );

  const generate = async () => {
    if (pantry.length === 0) {
      setError("Add ingredients to your pantry first.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const r = await generateAIRecipe({
        pantry,
        max_time: 45,
        diet: profile.habits,
        avoid: profile.avoid,
        craving: freeform.trim() ? freeform.trim() : craving,
      });
      setRecipe(r);
      const existing = await storage.getAIRecipes();
      await storage.setAIRecipes([r, ...existing].slice(0, 20));
    } catch (e: any) {
      setError(e?.message || "The chef stumbled. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.topBar}>
        <Pressable testID="ai-back" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={12} color={theme.colors.onBrand} />
          <Text style={styles.badgeText}>AI CHEF</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.h1}>
            A dish invented{"\n"}
            <Text style={styles.h1Accent}>for tonight.</Text>
          </Text>
          <Text style={styles.body}>
            Ruchio’s chef reads your pantry, taste and mood — then improvises one recipe just for you.
          </Text>
        </View>

        <Text style={styles.label}>Your vibe</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {CRAVINGS.map((c) => (
            <Chip
              key={c}
              testID={`craving-${c}`}
              label={c}
              selected={craving === c}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCraving(c);
              }}
            />
          ))}
        </ScrollView>

        <Text style={styles.label}>Or describe it (optional)</Text>
        <TextInput
          testID="ai-chef-freeform"
          value={freeform}
          onChangeText={setFreeform}
          placeholder="e.g. Something warm and Bengali"
          placeholderTextColor={theme.colors.onSurfaceFaint}
          style={styles.textArea}
          multiline
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons name="basket-outline" size={16} color={theme.colors.brand} />
            <Text style={styles.summaryText}>{pantry.length ? `${pantry.length} pantry items` : "Pantry empty"}</Text>
            <Pressable testID="ai-open-pantry" onPress={() => router.push("/(tabs)/pantry")} style={styles.summaryLink}>
              <Text style={styles.summaryLinkText}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="leaf-outline" size={16} color={theme.colors.brand} />
            <Text style={styles.summaryText}>{profile.habits}</Text>
          </View>
          {profile.avoid.length > 0 && (
            <View style={styles.summaryRow}>
              <Ionicons name="close-circle-outline" size={16} color={theme.colors.brand} />
              <Text style={styles.summaryText} numberOfLines={1}>
                Avoid: {profile.avoid.slice(0, 3).join(", ")}
                {profile.avoid.length > 3 ? ` +${profile.avoid.length - 3}` : ""}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <PrimaryButton
            testID="ai-chef-generate"
            label={loading ? "Simmering ideas…" : "Improvise a dish"}
            onPress={generate}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator size="small" color={theme.colors.onBrand} />
              ) : (
                <Ionicons name="sparkles" size={18} color={theme.colors.onBrand} />
              )
            }
          />
        </View>

        {error && (
          <View testID="ai-chef-error" style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {recipe && (
          <View testID="ai-chef-result" style={styles.result}>
            <Text style={styles.resultEyebrow}>Chef’s Special</Text>
            <Text style={styles.resultTitle}>{recipe.name}</Text>
            <Text style={styles.resultTagline}>{recipe.tagline}</Text>
            <View style={styles.metaRow}>
              <MetaPill icon="time-outline" text={`${recipe.time} min`} />
              <MetaPill icon="flame-outline" text={recipe.spice} />
              <MetaPill icon="leaf-outline" text={recipe.diet} />
              <MetaPill icon="location-outline" text={recipe.region} />
            </View>

            <Text style={styles.sub}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingText}>{ing}</Text>
              </View>
            ))}

            <Text style={styles.sub}>Steps</Text>
            {recipe.instructions.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaPill({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={12} color={theme.colors.brand} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
  },
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  },
  badgeText: { fontFamily: "GeistBold", fontSize: 10, color: theme.colors.onBrand, letterSpacing: 1.3 },
  hero: { paddingHorizontal: 24, paddingTop: 14 },
  h1: { fontFamily: "FrauncesBold", fontSize: 40, lineHeight: 42, color: theme.colors.onSurface, letterSpacing: -1.2, marginBottom: 12 },
  h1Accent: { fontFamily: "FrauncesItalic", color: theme.colors.brand },
  body: { fontFamily: "Geist", fontSize: 15, lineHeight: 22, color: theme.colors.onSurfaceMuted },
  label: {
    fontFamily: "GeistMedium",
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.onSurfaceFaint,
    textTransform: "uppercase",
    marginTop: 26,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  chipRow: { paddingHorizontal: 20, gap: 8 },
  textArea: {
    marginHorizontal: 20,
    minHeight: 80,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    fontFamily: "Geist",
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlignVertical: "top",
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: { flex: 1, fontFamily: "GeistMedium", fontSize: 13, color: theme.colors.onSurface },
  summaryLink: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLinkText: { fontFamily: "GeistBold", fontSize: 11, color: theme.colors.brand, letterSpacing: 0.8 },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.errorTint,
    borderWidth: 1,
    borderColor: theme.colors.error,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: { fontFamily: "GeistMedium", fontSize: 13, color: theme.colors.error, flex: 1 },
  result: {
    marginTop: 28,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  resultEyebrow: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.8,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  resultTitle: { fontFamily: "FrauncesBold", fontSize: 28, color: theme.colors.onSurface, letterSpacing: -0.6, lineHeight: 32 },
  resultTagline: { fontFamily: "FrauncesItalic", fontSize: 15, color: theme.colors.onSurfaceMuted, marginTop: 6 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface3,
  },
  metaText: { fontFamily: "GeistMedium", fontSize: 11, color: theme.colors.onSurface },
  sub: {
    fontFamily: "GeistBold",
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginTop: 22,
    marginBottom: 10,
  },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.brand },
  ingText: { fontFamily: "Geist", fontSize: 14, color: theme.colors.onSurface, flex: 1 },
  stepRow: { flexDirection: "row", gap: 12, paddingVertical: 8 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontFamily: "GeistBold", fontSize: 12, color: theme.colors.onBrand },
  stepText: { flex: 1, fontFamily: "Geist", fontSize: 14, lineHeight: 21, color: theme.colors.onSurface },
});
