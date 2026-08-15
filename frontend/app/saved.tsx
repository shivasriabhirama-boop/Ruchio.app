import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { ALL_RECIPES, Recipe } from "@/src/data/recipes";
import { storage } from "@/src/storage";
import { Stars } from "@/src/ui";

export default function Saved() {
  const router = useRouter();
  const [favs, setFavs] = useState<Recipe[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, { stars: number }>>({});

  useFocusEffect(
    useCallback(() => {
      Promise.all([storage.getFavorites(), storage.getPhotos(), storage.getRatings()]).then(
        ([ids, ph, rt]) => {
          const list = ALL_RECIPES.filter((r) => ids.includes(r.id)).sort(
            (a, b) => (rt[b.id]?.stars || 0) - (rt[a.id]?.stars || 0)
          );
          setFavs(list);
          setPhotos(ph);
          setRatings(rt);
        }
      );
    }, [])
  );

  const remove = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const ids = (await storage.getFavorites()).filter((x) => x !== id);
    await storage.setFavorites(ids);
    setFavs(ALL_RECIPES.filter((r) => ids.includes(r.id)));
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable testID="saved-back" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Your Collection</Text>
          <Text style={styles.title}>Saved dishes</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {favs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyBody}>Tap the heart on any recipe to keep it here.</Text>
          </View>
        ) : (
          favs.map((r) => {
            const img = photos[r.id] || r.image;
            return (
              <Pressable
                key={r.id}
                testID={`saved-item-${r.id}`}
                onPress={() => router.push(`/recipe/${r.id}`)}
                style={styles.row}
              >
                <View style={styles.thumbWrap}>
                  <Image source={img} style={styles.thumb} contentFit="cover" />
                  {photos[r.id] && (
                    <View style={styles.camTag}>
                      <Ionicons name="camera" size={10} color="#FFF" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {r.region} • {r.time} min • {r.spice}
                  </Text>
                  {(ratings[r.id]?.stars || 0) > 0 && (
                    <View style={{ marginTop: 4 }}>
                      <Stars value={ratings[r.id]?.stars || 0} size={12} />
                    </View>
                  )}
                </View>
                <Pressable testID={`saved-remove-${r.id}`} onPress={() => remove(r.id)} hitSlop={8} style={styles.removeBtn}>
                  <Ionicons name="heart" size={16} color={theme.colors.brand} />
                </Pressable>
              </Pressable>
            );
          })
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
    paddingBottom: 16,
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
  empty: { alignItems: "center", padding: 40, gap: 8 },
  emptyTitle: { fontFamily: "FrauncesBold", fontSize: 20, color: theme.colors.onSurface },
  emptyBody: { fontFamily: "Geist", fontSize: 13, color: theme.colors.onSurfaceMuted, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    marginBottom: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  thumbWrap: { width: 64, height: 64, borderRadius: theme.radius.sm, overflow: "hidden" },
  thumb: { width: "100%", height: "100%" },
  camTag: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontFamily: "FrauncesBold", fontSize: 17, color: theme.colors.onSurface, letterSpacing: -0.3 },
  rowSub: { fontFamily: "Geist", fontSize: 12, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandTint,
  },
});
