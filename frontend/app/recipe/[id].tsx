import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { ALL_RECIPES, Recipe } from "@/src/data/recipes";
import { storage, mergeShopping } from "@/src/storage";
import { captureDishPhoto } from "@/src/photos";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recipe: Recipe | undefined = ALL_RECIPES.find((r) => r.id === id);
  const [pantry, setPantry] = useState<string[]>([]);
  const [fav, setFav] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([storage.getPantry(), storage.getFavorites(), storage.getPhotos()]).then(
        ([p, f, ph]) => {
          setPantry(p);
          setFav(f.includes(id!));
          setPhoto(ph[id!] || null);
        }
      );
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleFav = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const list = await storage.getFavorites();
    const next = list.includes(recipe.id) ? list.filter((x) => x !== recipe.id) : [...list, recipe.id];
    await storage.setFavorites(next);
    setFav(next.includes(recipe.id));
  };

  const addNeedToShopping = async () => {
    if (need.length === 0) {
      showToast("You already have everything");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const existing = await storage.getShopping();
    await storage.setShopping(mergeShopping(existing, need));
    showToast(`${need.length} items added to list`);
  };

  const takePhoto = async (source: "camera" | "library") => {
    setBlocked(false);
    const res = await captureDishPhoto(source);
    if (res.blocked) {
      setBlocked(true);
      return;
    }
    if (res.uri) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const photos = await storage.getPhotos();
      const next = { ...photos, [recipe.id]: res.uri };
      await storage.setPhotos(next);
      setPhoto(res.uri);
      showToast("Dish photo saved");
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.heroWrap}>
          <Image source={recipe.image} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} />
          <LinearGradient
            colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.95)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.heroSafe} edges={["top"]}>
            <View style={styles.heroActions}>
              <Pressable testID="detail-back" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={20} color="#FFF" />
              </Pressable>
              <Pressable testID="detail-fav" onPress={toggleFav} hitSlop={10} style={styles.iconBtn}>
                <Ionicons name={fav ? "heart" : "heart-outline"} size={20} color={fav ? theme.colors.brand : "#FFF"} />
              </Pressable>
            </View>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <Text style={styles.eyebrow}>
              {recipe.region} • {recipe.meal}
            </Text>
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
          {/* Your dish photo */}
          <View style={styles.photoBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.section}>Your dish</Text>
            </View>
            {photo ? (
              <View style={styles.photoWrap}>
                <Image source={photo} style={styles.photo} contentFit="cover" />
                <Pressable testID="detail-retake-photo" onPress={() => takePhoto("camera")} style={styles.retake}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                  <Text style={styles.retakeText}>Retake</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoBtns}>
                <Pressable testID="detail-photo-camera" onPress={() => takePhoto("camera")} style={styles.photoBtn}>
                  <Ionicons name="camera-outline" size={18} color={theme.colors.brand} />
                  <Text style={styles.photoBtnText}>Take a photo</Text>
                </Pressable>
                <Pressable testID="detail-photo-gallery" onPress={() => takePhoto("library")} style={styles.photoBtn}>
                  <Ionicons name="images-outline" size={18} color={theme.colors.brand} />
                  <Text style={styles.photoBtnText}>Gallery</Text>
                </Pressable>
              </View>
            )}
            {blocked && (
              <Pressable testID="detail-open-settings" onPress={() => Linking.openSettings()} style={styles.settingsBtn}>
                <Ionicons name="settings-outline" size={14} color={theme.colors.onSurface} />
                <Text style={styles.settingsText}>Enable camera access in Settings</Text>
              </Pressable>
            )}
          </View>

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
              <Pressable testID="detail-add-shopping" onPress={addNeedToShopping} style={styles.addShopBtn}>
                <Ionicons name="cart" size={15} color={theme.colors.onBrand} />
                <Text style={styles.addShopText}>Add {need.length} to shopping list</Text>
              </Pressable>
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

      {/* Sticky Cook Mode CTA */}
      <SafeAreaView edges={["bottom"]} style={styles.ctaWrap}>
        <Pressable testID="start-cooking" onPress={() => router.push(`/cook/${recipe.id}`)} style={styles.cta}>
          <Ionicons name="flame" size={18} color={theme.colors.onBrand} />
          <Text style={styles.ctaText}>Start Cooking</Text>
        </Pressable>
      </SafeAreaView>

      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.brand} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
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
  heroWrap: { height: 440, overflow: "hidden" },
  heroSafe: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 20 },
  heroActions: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottom: { position: "absolute", left: 24, right: 24, bottom: 24 },
  eyebrow: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.6,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { fontFamily: "FrauncesBold", fontSize: 34, color: "#FFF", letterSpacing: -1, lineHeight: 38 },
  tagline: { fontFamily: "FrauncesItalic", fontSize: 15, color: "#EAEAEA", marginTop: 8 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  metaText: { fontFamily: "GeistBold", fontSize: 11, color: "#FFF" },
  body: { padding: 24 },
  section: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.8,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  photoBlock: { marginBottom: 6 },
  photoWrap: { borderRadius: theme.radius.lg, overflow: "hidden", height: 200, borderWidth: 1, borderColor: theme.colors.border },
  photo: { width: "100%", height: "100%" },
  retake: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  retakeText: { fontFamily: "GeistBold", fontSize: 12, color: "#FFF" },
  photoBtns: { flexDirection: "row", gap: 10 },
  photoBtn: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.brand,
    backgroundColor: theme.colors.brandTint,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoBtnText: { fontFamily: "GeistBold", fontSize: 13, color: theme.colors.brandDeep },
  settingsBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  settingsText: { fontFamily: "GeistMedium", fontSize: 13, color: theme.colors.onSurface },
  groupBox: {
    padding: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    marginBottom: 10,
  },
  groupLabel: { fontFamily: "GeistBold", fontSize: 11, letterSpacing: 1, color: theme.colors.success, marginBottom: 8 },
  ingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  ingText: { fontFamily: "Geist", fontSize: 14, color: theme.colors.onSurface, flex: 1 },
  addShopBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addShopText: { fontFamily: "GeistBold", fontSize: 13, color: theme.colors.onBrand },
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
  ctaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cta: {
    height: 54,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 6,
  },
  ctaText: { fontFamily: "GeistBold", fontSize: 15, color: theme.colors.onBrand, letterSpacing: 0.3 },
  toast: {
    position: "absolute",
    top: 100,
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
