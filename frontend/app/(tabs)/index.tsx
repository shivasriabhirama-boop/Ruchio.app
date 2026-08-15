import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { MEAL_FILTERS } from "@/src/data/recipes";
import { storage, Profile, defaultProfile } from "@/src/storage";
import { scoreRecipes, Match } from "@/src/match";
import { Wordmark, Chip, Stars } from "@/src/ui";

export default function Discover() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [pantry, setPantry] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shoppingCount, setShoppingCount] = useState(0);
  const [ratings, setRatings] = useState<Record<string, { stars: number; note: string }>>({});
  const [meal, setMeal] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [p, pt, f, s, r] = await Promise.all([
      storage.getProfile(),
      storage.getPantry(),
      storage.getFavorites(),
      storage.getShopping(),
      storage.getRatings(),
    ]);
    setProfile(p);
    setPantry(pt);
    setFavorites(f);
    setShoppingCount(s.filter((i) => !i.checked).length);
    setRatings(r);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const matches = useMemo(
    () => scoreRecipes(pantry, profile, meal, ratings),
    [pantry, profile, meal, ratings]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await load();
    setTimeout(() => setRefreshing(false), 400);
  };

  const toggleFav = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    await storage.setFavorites(next);
  };

  const surprise = () => {
    if (matches.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const pool = matches.slice(0, 5);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/recipe/${chosen.recipe.id}`);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.recipe.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.brand} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>Hello, {profile.name || "friend"}</Text>
                <Wordmark size={38} />
              </View>
              <Pressable
                testID="open-shopping"
                onPress={() => router.push("/shopping")}
                style={styles.iconBtn}
                hitSlop={8}
              >
                <Ionicons name="cart-outline" size={20} color={theme.colors.onSurface} />
                {shoppingCount > 0 && (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeDotText}>{shoppingCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                testID="open-saved"
                onPress={() => router.push("/saved")}
                style={[styles.iconBtn, { marginLeft: 10 }]}
                hitSlop={8}
              >
                <Ionicons name="heart-outline" size={20} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            {/* Quick actions: AI Chef + Leftover Mode */}
            <View style={styles.quickRow}>
              <Pressable testID="open-ai-chef" onPress={() => router.push("/ai-chef")} style={styles.quickCard}>
                <View style={styles.quickIcon}>
                  <Ionicons name="sparkles" size={18} color={theme.colors.onBrand} />
                </View>
                <Text style={styles.quickTitle}>AI Chef</Text>
                <Text style={styles.quickSub}>Invent a dish</Text>
              </Pressable>
              <Pressable
                testID="open-leftover"
                onPress={() => router.push("/leftover")}
                style={[styles.quickCard, styles.quickCardAlt]}
              >
                <View style={[styles.quickIcon, { backgroundColor: theme.colors.onSurface }]}>
                  <Ionicons name="flash" size={18} color="#FFF" />
                </View>
                <Text style={styles.quickTitle}>Leftover Mode</Text>
                <Text style={styles.quickSub}>Fast, few items</Text>
              </Pressable>
            </View>

            {/* Surprise hero */}
            <Pressable testID="surprise-dish" onPress={surprise} style={styles.hero}>
              <Image
                source="https://images.unsplash.com/photo-1631292784640-2b24be784d5d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080"
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.85)"]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroBadge}>
                <Ionicons name="shuffle" size={12} color="#FFF" />
                <Text style={styles.heroBadgeText}>SURPRISE ME</Text>
              </View>
              <Text style={styles.heroTitle}>Not sure? We’ll pick tonight’s dish.</Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>Roll the wok</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.onBrand} />
              </View>
            </Pressable>

            <View style={styles.chipHeader}>
              <Text style={styles.chipHeaderText}>{matches.length} dishes • filter by meal</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {MEAL_FILTERS.map((m) => (
                <Chip
                  key={m}
                  testID={`meal-filter-${m}`}
                  label={m}
                  selected={meal === m}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setMeal(m);
                  }}
                />
              ))}
            </ScrollView>

            {pantry.length === 0 && (
              <View style={styles.emptyPantry}>
                <Ionicons name="basket-outline" size={20} color={theme.colors.brand} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.emptyPantryTitle}>Your pantry is empty</Text>
                  <Text style={styles.emptyPantryBody}>Add ingredients to unlock matches.</Text>
                </View>
                <Pressable
                  testID="cta-open-pantry"
                  onPress={() => router.push("/(tabs)/pantry")}
                  style={styles.emptyPantryCta}
                >
                  <Text style={styles.emptyPantryCtaText}>Add</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <RecipeCard
            match={item}
            fav={favorites.includes(item.recipe.id)}
            rating={ratings[item.recipe.id]?.stars || 0}
            onFav={() => toggleFav(item.recipe.id)}
            onOpen={() => router.push(`/recipe/${item.recipe.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBlock}>
            <Ionicons name="restaurant-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>Nothing on the menu</Text>
            <Text style={styles.emptyBody}>Try another meal filter or stock your pantry.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function RecipeCard({
  match,
  fav,
  rating,
  onFav,
  onOpen,
}: {
  match: Match;
  fav: boolean;
  rating: number;
  onFav: () => void;
  onOpen: () => void;
}) {
  const badgeColor =
    match.matchType === "Perfect"
      ? theme.colors.success
      : match.matchType === "Close"
      ? theme.colors.brand
      : "#8A8A8A";
  return (
    <Pressable testID={`recipe-card-${match.recipe.id}`} onPress={onOpen} style={styles.card}>
      <Image source={match.recipe.image} style={styles.cardImg} contentFit="cover" transition={300} />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.9)"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardTop}>
        <View style={styles.matchBadge}>
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Text style={styles.matchBadgeText}>{match.matchType} match</Text>
        </View>
        <Pressable testID={`fav-${match.recipe.id}`} hitSlop={10} onPress={onFav} style={styles.favBtn}>
          <Ionicons name={fav ? "heart" : "heart-outline"} size={18} color={fav ? theme.colors.brand : "#FFF"} />
        </Pressable>
      </View>
      <View style={styles.cardBottom}>
        {rating > 0 && (
          <View style={styles.cardStars} testID={`card-rating-${match.recipe.id}`}>
            <Stars value={rating} size={13} />
          </View>
        )}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {match.recipe.name}
        </Text>
        <Text style={styles.cardTagline} numberOfLines={1}>
          {match.recipe.tagline}
        </Text>
        <View style={styles.metaRow}>
          <Meta icon="time-outline" text={`${match.recipe.time} min`} />
          <Meta icon="flame-outline" text={match.recipe.spice} />
          <Meta icon="leaf-outline" text={match.recipe.diet} />
        </View>
        <Text style={styles.needText} numberOfLines={1}>
          {match.missing.length === 0
            ? "You have everything"
            : `Need ${match.missing.length}: ${match.missing.slice(0, 3).join(", ")}`}
        </Text>
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color="#EDEDED" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 18,
  },
  eyebrow: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    letterSpacing: 1.4,
    color: theme.colors.onSurfaceFaint,
    textTransform: "uppercase",
    marginBottom: 4,
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
  badgeDot: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDotText: { fontFamily: "GeistBold", fontSize: 10, color: theme.colors.onBrand },
  quickRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 18 },
  quickCard: {
    flex: 1,
    padding: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brandTint,
    borderWidth: 1,
    borderColor: "#DAD8F7",
    gap: 4,
  },
  quickCardAlt: {
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.border,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickTitle: { fontFamily: "FrauncesBold", fontSize: 17, color: theme.colors.onSurface, letterSpacing: -0.3 },
  quickSub: { fontFamily: "Geist", fontSize: 12, color: theme.colors.onSurfaceMuted },
  hero: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 20,
    marginBottom: 22,
  },
  heroBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBadgeText: { fontFamily: "GeistBold", fontSize: 10, color: "#FFF", letterSpacing: 1.3 },
  heroTitle: {
    fontFamily: "FrauncesBold",
    fontSize: 24,
    color: "#FFF",
    letterSpacing: -0.6,
    lineHeight: 28,
    marginBottom: 14,
    maxWidth: "88%",
  },
  heroCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  },
  heroCtaText: { fontFamily: "GeistBold", fontSize: 13, color: theme.colors.onBrand },
  chipHeader: { paddingHorizontal: 24, marginBottom: 10 },
  chipHeaderText: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    color: theme.colors.onSurfaceFaint,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },
  emptyPantry: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyPantryTitle: { fontFamily: "GeistBold", fontSize: 14, color: theme.colors.onSurface },
  emptyPantryBody: { fontFamily: "Geist", fontSize: 12, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  emptyPantryCta: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPantryCtaText: { fontFamily: "GeistBold", fontSize: 12, color: theme.colors.onBrand },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    height: 300,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.surface4,
  },
  cardImg: { ...StyleSheet.absoluteFillObject },
  cardTop: { flexDirection: "row", justifyContent: "space-between", padding: 14 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  matchBadgeText: {
    fontFamily: "GeistBold",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#FFF",
  },
  favBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  cardBottom: { marginTop: "auto", padding: 18, gap: 8 },
  cardStars: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardTitle: { fontFamily: "FrauncesBold", fontSize: 24, color: "#FFF", letterSpacing: -0.6, lineHeight: 27 },
  cardTagline: { fontFamily: "FrauncesItalic", fontSize: 13, color: "#DEDEDE" },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  metaText: { fontFamily: "GeistMedium", fontSize: 11, color: "#EDEDED" },
  needText: { fontFamily: "Geist", fontSize: 12, color: "#CFCFCF", marginTop: 2 },
  emptyBlock: { alignItems: "center", padding: 40, gap: 10 },
  emptyTitle: { fontFamily: "FrauncesBold", fontSize: 20, color: theme.colors.onSurface },
  emptyBody: { fontFamily: "Geist", fontSize: 14, color: theme.colors.onSurfaceMuted, textAlign: "center" },
});
