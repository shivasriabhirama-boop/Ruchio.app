import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { ALL_RECIPES, Recipe } from "@/src/data/recipes";
import { storage, Profile, defaultProfile, MenuDay, mergeShopping } from "@/src/storage";
import { scoreRecipes } from "@/src/match";
import { PrimaryButton } from "@/src/ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildMenu(pantry: string[], profile: Profile): MenuDay[] {
  const matches = scoreRecipes(pantry, profile, "All");
  const pool = (matches.length ? matches.map((m) => m.recipe) : ALL_RECIPES).filter(Boolean);
  // Shuffle a copy for variety
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return DAYS.map((day, i) => ({
    day,
    recipeId: shuffled.length ? shuffled[i % shuffled.length].id : null,
  }));
}

export default function Planner() {
  const router = useRouter();
  const [menu, setMenu] = useState<MenuDay[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [pantry, setPantry] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [m, p, pt] = await Promise.all([
      storage.getMenu(),
      storage.getProfile(),
      storage.getPantry(),
    ]);
    setProfile(p);
    setPantry(pt);
    setMenu(m);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const regenerate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const m = buildMenu(pantry, profile);
    setMenu(m);
    await storage.setMenu(m);
    setToast("Fresh week planned");
    setTimeout(() => setToast(null), 1500);
  };

  const shuffleDay = async (index: number) => {
    Haptics.selectionAsync().catch(() => {});
    const matches = scoreRecipes(pantry, profile, "All");
    const pool = matches.length ? matches.map((m) => m.recipe) : ALL_RECIPES;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const next = menu.map((d, i) => (i === index ? { ...d, recipeId: pick.id } : d));
    setMenu(next);
    await storage.setMenu(next);
  };

  const addWeekToShopping = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const pantrySet = new Set(pantry);
    const needed = new Set<string>();
    menu.forEach((d) => {
      const r = ALL_RECIPES.find((x) => x.id === d.recipeId);
      r?.ingredients.forEach((ing) => {
        if (!pantrySet.has(ing)) needed.add(ing);
      });
    });
    const existing = await storage.getShopping();
    await storage.setShopping(mergeShopping(existing, [...needed]));
    setToast(`${needed.size} items added to list`);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Weekly Menu</Text>
          <Text style={styles.h1}>
            Your 7-day{"\n"}
            <Text style={styles.h1Accent}>meal plan.</Text>
          </Text>
        </View>

        {menu.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>No plan yet</Text>
            <Text style={styles.emptyBody}>
              Generate a smart week built from your pantry and taste.
            </Text>
            <View style={{ width: "100%", marginTop: 16 }}>
              <PrimaryButton
                testID="planner-generate"
                label="Plan my week"
                onPress={regenerate}
                icon={<Ionicons name="sparkles" size={18} color={theme.colors.onBrand} />}
              />
            </View>
          </View>
        ) : (
          <View>
            {menu.map((d, i) => {
              const r: Recipe | undefined = ALL_RECIPES.find((x) => x.id === d.recipeId);
              return (
                <View key={d.day} style={styles.dayCard} testID={`planner-day-${d.day}`}>
                  <View style={styles.dayTag}>
                    <Text style={styles.dayTagText}>{d.day.slice(0, 3).toUpperCase()}</Text>
                  </View>
                  {r ? (
                    <Pressable
                      style={styles.dayContent}
                      onPress={() => router.push(`/recipe/${r.id}`)}
                      testID={`planner-open-${d.day}`}
                    >
                      <Image source={r.image} style={styles.dayImg} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dayName} numberOfLines={2}>
                          {r.name}
                        </Text>
                        <Text style={styles.dayMeta}>
                          {r.time} min • {r.meal} • {r.spice}
                        </Text>
                      </View>
                      <Pressable
                        testID={`planner-shuffle-${d.day}`}
                        onPress={() => shuffleDay(i)}
                        hitSlop={10}
                        style={styles.shuffleBtn}
                      >
                        <Ionicons name="shuffle" size={16} color={theme.colors.brand} />
                      </Pressable>
                    </Pressable>
                  ) : (
                    <Text style={styles.dayEmpty}>—</Text>
                  )}
                </View>
              );
            })}

            <View style={styles.actions}>
              <Pressable testID="planner-add-shopping" onPress={addWeekToShopping} style={styles.secondaryBtn}>
                <Ionicons name="cart-outline" size={18} color={theme.colors.brand} />
                <Text style={styles.secondaryBtnText}>Add week’s items to list</Text>
              </Pressable>
              <Pressable testID="planner-regenerate" onPress={regenerate} style={styles.regenBtn}>
                <Ionicons name="refresh" size={16} color={theme.colors.onSurfaceMuted} />
                <Text style={styles.regenText}>Regenerate week</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {toast && (
        <View style={[styles.toast, { pointerEvents: "none" }]}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.brand} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  eyebrow: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  h1: { fontFamily: "FrauncesBold", fontSize: 38, lineHeight: 40, letterSpacing: -1.2, color: theme.colors.onSurface },
  h1Accent: { fontFamily: "FrauncesItalic", color: theme.colors.brand },
  empty: { alignItems: "center", padding: 32, marginTop: 20 },
  emptyTitle: { fontFamily: "FrauncesBold", fontSize: 22, color: theme.colors.onSurface, marginTop: 12 },
  emptyBody: {
    fontFamily: "Geist",
    fontSize: 14,
    color: theme.colors.onSurfaceMuted,
    textAlign: "center",
    marginTop: 6,
  },
  dayCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  dayTag: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: theme.colors.onSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  dayTagText: { fontFamily: "GeistBold", fontSize: 10, color: "#FFF", letterSpacing: 1 },
  dayContent: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  dayImg: { width: 68, height: 68, borderRadius: theme.radius.md },
  dayName: { fontFamily: "FrauncesBold", fontSize: 17, color: theme.colors.onSurface, letterSpacing: -0.3 },
  dayMeta: { fontFamily: "Geist", fontSize: 12, color: theme.colors.onSurfaceMuted, marginTop: 3 },
  dayEmpty: { padding: 20, fontFamily: "Geist", color: theme.colors.onSurfaceFaint },
  shuffleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { paddingHorizontal: 20, marginTop: 12, gap: 12 },
  secondaryBtn: {
    height: 52,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandTint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryBtnText: { fontFamily: "GeistBold", fontSize: 14, color: theme.colors.brandDeep },
  regenBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  regenText: { fontFamily: "GeistMedium", fontSize: 13, color: theme.colors.onSurfaceMuted },
  toast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.brand,
  },
  toastText: { fontFamily: "GeistBold", fontSize: 13, color: theme.colors.onSurface },
});
