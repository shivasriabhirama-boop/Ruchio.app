import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { ALL_RECIPES, Recipe } from "@/src/data/recipes";
import { storage } from "@/src/storage";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe: Recipe | undefined = ALL_RECIPES.find((r) => r.id === id);
  const [pantry, setPantry] = useState<string[]>([]);
  const [fav, setFav] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([storage.getPantry(), storage.getFavorites()]).then(([p, f]) => {
        setPantry(p);
        setFav(f.includes(id!));
      });
    }, [id])
  );

  if (!recipe) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.notFound}>Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  const pantrySet = new Set(pantry);
  const have = recipe.ingredients.filter((i) => pantrySet.has(i));
  const need = recipe.ingredients.filter((i) => !pantrySet.has(i));

  const toggleFav = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const list = await storage.getFavorites();
    const next = list.includes(recipe.id) ? list.filter((x) => x !== recipe.id) : [...list, recipe.id];
    await storage.setFavorites(next);
    setFav(next.includes(recipe.id));
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.heroWrap}>
          <Image source={recipe.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(15,15,15,0.35)", "rgba(15,15,15,1)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.heroSafe} edges={["top"]}>
            <View style={styles.heroActions}>
              <Pressable
                testID="detail-back"
                onPress={() => router.back()}
                hitSlop={10}
                style={styles.iconBtn}
              >
                <Ionicons name="arrow-back" size={20} color="#FFF" />
              </Pressable>
              <Pressable testID="detail-fav" onPress={toggleFav} hitSlop={10} style={styles.iconBtn}>
                <Ionicons
                  name={fav ? "heart" : "heart-outline"}
                  size={20}
                  color={fav ? theme.colors.brand : "#FFF"}
                />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <Text style={styles.eyebrow}>{recipe.region} • {recipe.meal}</Text>
            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={styles.tagline}>{recipe.tagline}</Text>
            <View style={styles.metaRow}>
              <Meta icon="time-outline" text={`${recipe.time} min`} />
              <Meta icon="flame-outline" text={recipe.spice} />
              <Meta icon="leaf-outline" text={recipe.diet} />
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.section}>Ingredients</Text>
          {have.length > 0 && (
            <View style={styles.groupBox}>
              <Text style={styles.groupLabel}>
                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} /> You have
              </Text>
              {have.map((h) => (
                <IngRow key={h} text={h} have />
              ))}
            </View>
          )}
          {need.length > 0 && (
            <View style={[styles.groupBox, { borderColor: theme.colors.brand }]}>
              <Text style={[styles.groupLabel, { color: theme.colors.brand }]}>
                <Ionicons name="cart-outline" size={12} color={theme.colors.brand} /> You need
              </Text>
              {need.map((h) => (
                <IngRow key={h} text={h} />
              ))}
            </View>
          )}

          <Text style={styles.section}>Steps</Text>
          {recipe.instructions.map((s, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={12} color="#FFF" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function IngRow({ text, have }: { text: string; have?: boolean }) {
  return (
    <View style={styles.ingRow}>
      <View style={[styles.bullet, { backgroundColor: have ? theme.colors.success : theme.colors.brand }]} />
      <Text style={styles.ingText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  notFound: { color: theme.colors.onSurface, fontFamily: "Geist", padding: 24 },
  heroWrap: {
    height: 460,
    overflow: "hidden",
  },
  heroSafe: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
  },
  heroActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15,15,15,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
  },
  eyebrow: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.6,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontFamily: "FrauncesBold",
    fontSize: 34,
    color: "#FFF",
    letterSpacing: -1,
    lineHeight: 38,
  },
  tagline: {
    fontFamily: "FrauncesItalic",
    fontSize: 15,
    color: "#E5E5E5",
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(15,15,15,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  metaText: { fontFamily: "GeistBold", fontSize: 11, color: "#FFF" },
  body: {
    padding: 24,
  },
  section: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.8,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 12,
  },
  groupBox: {
    padding: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
  },
  groupLabel: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.success,
    marginBottom: 8,
  },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 5,
  },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  ingText: { fontFamily: "Geist", fontSize: 14, color: theme.colors.onSurface, flex: 1 },
  step: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.divider,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: { fontFamily: "GeistBold", fontSize: 12, color: theme.colors.onBrand },
  stepText: { flex: 1, fontFamily: "Geist", fontSize: 15, lineHeight: 22, color: theme.colors.onSurface },
});
