import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "@/src/theme";
import { storage, Profile, defaultProfile } from "@/src/storage";
import { leftoverMatches, Match } from "@/src/match";

export default function Leftover() {
  const router = useRouter();
  const [pantry, setPantry] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [ratings, setRatings] = useState<Record<string, { stars: number }>>({});

  useFocusEffect(
    useCallback(() => {
      Promise.all([storage.getPantry(), storage.getProfile(), storage.getRatings()]).then(
        ([pt, p, r]) => {
          setPantry(pt);
          setProfile(p);
          setRatings(r);
        }
      );
    }, [])
  );

  const results: Match[] = leftoverMatches(pantry, profile, ratings);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable testID="leftover-back" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Leftover Mode</Text>
          <Text style={styles.title}>Busy-night bites</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Quick dishes (≤ 25 min) that use just a few things you already have — perfect when the
          fridge is looking bare.
        </Text>

        {pantry.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="basket-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>Stock your pantry first</Text>
            <Text style={styles.emptyBody}>Add a few ingredients and we’ll find instant wins.</Text>
            <Pressable testID="leftover-open-pantry" onPress={() => router.push("/(tabs)/pantry")} style={styles.cta}>
              <Text style={styles.ctaText}>Open Pantry</Text>
            </Pressable>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flash-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>No instant wins yet</Text>
            <Text style={styles.emptyBody}>
              Add one or two more staples (like eggs, rice or onion) to unlock quick dishes.
            </Text>
          </View>
        ) : (
          results.map((m) => (
            <Pressable
              key={m.recipe.id}
              testID={`leftover-item-${m.recipe.id}`}
              onPress={() => router.push(`/recipe/${m.recipe.id}`)}
              style={styles.card}
            >
              <Image source={m.recipe.image} style={styles.thumb} contentFit="cover" />
              <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.15)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.cardBody}>
                <View style={styles.timePill}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.brandDeep} />
                  <Text style={styles.timeText}>{m.recipe.time} min</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {m.recipe.name}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {m.missing.length === 0
                    ? "You have everything ✓"
                    : `Just need ${m.missing.join(", ")}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.onSurfaceFaint} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
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
  eyebrow: {
    fontFamily: "GeistMedium",
    fontSize: 11,
    letterSpacing: 1.5,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: { fontFamily: "FrauncesBold", fontSize: 26, color: theme.colors.onSurface, letterSpacing: -0.8 },
  intro: { fontFamily: "Geist", fontSize: 14, lineHeight: 21, color: theme.colors.onSurfaceMuted, marginBottom: 18 },
  empty: { alignItems: "center", padding: 28, gap: 8 },
  emptyTitle: { fontFamily: "FrauncesBold", fontSize: 20, color: theme.colors.onSurface, marginTop: 10 },
  emptyBody: { fontFamily: "Geist", fontSize: 13, color: theme.colors.onSurfaceMuted, textAlign: "center" },
  cta: {
    marginTop: 14,
    paddingHorizontal: 20,
    height: 46,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontFamily: "GeistBold", fontSize: 14, color: theme.colors.onBrand },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    marginBottom: 12,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  thumb: { width: 72, height: 72, borderRadius: theme.radius.md },
  cardBody: { flex: 1, gap: 5 },
  timePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandTint,
  },
  timeText: { fontFamily: "GeistBold", fontSize: 11, color: theme.colors.brandDeep },
  cardTitle: { fontFamily: "FrauncesBold", fontSize: 18, color: theme.colors.onSurface, letterSpacing: -0.3 },
  cardMeta: { fontFamily: "Geist", fontSize: 12, color: theme.colors.onSurfaceMuted },
});
