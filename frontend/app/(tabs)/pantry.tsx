import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { INGREDIENT_CATEGORIES } from "@/src/data/recipes";
import { storage } from "@/src/storage";
import { Chip, PrimaryButton } from "@/src/ui";

export default function PantryScreen() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      storage.getPantry().then(setPantry);
    }, [])
  );

  const toggle = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPantry((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));
  };

  const save = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await storage.setPantry(pantry);
    setToast("Pantry saved");
    setTimeout(() => setToast(null), 1600);
  };

  const clearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPantry([]);
  };

  const q = query.trim().toLowerCase();
  const filteredCats = INGREDIENT_CATEGORIES.map((c) => ({
    ...c,
    items: q ? c.items.filter((i) => i.toLowerCase().includes(q)) : c.items,
  })).filter((c) => c.items.length > 0);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Your Pantry</Text>
          <Text style={styles.h1}>
            What’s{"\n"}
            <Text style={styles.h1Accent}>in the kitchen?</Text>
          </Text>
          <View style={styles.statPill}>
            <Ionicons name="basket" size={13} color={theme.colors.brand} />
            <Text style={styles.statText}>{pantry.length} items selected</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={theme.colors.onSurfaceFaint} />
          <TextInput
            testID="pantry-search"
            value={query}
            onChangeText={setQuery}
            placeholder="Search ingredients"
            placeholderTextColor={theme.colors.onSurfaceFaint}
            style={styles.searchInput}
          />
          {!!query && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={theme.colors.onSurfaceFaint} />
            </Pressable>
          )}
        </View>

        {filteredCats.map((cat) => (
          <View key={cat.title} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{cat.title}</Text>
              <Text style={styles.sectionMeta}>
                {cat.items.filter((i) => pantry.includes(i)).length}/{cat.items.length}
              </Text>
            </View>
            <View style={styles.chipWrap}>
              {cat.items.map((i) => (
                <Chip
                  key={i}
                  testID={`pantry-chip-${i}`}
                  label={i}
                  selected={pantry.includes(i)}
                  onPress={() => toggle(i)}
                />
              ))}
            </View>
          </View>
        ))}

        {pantry.length > 0 && (
          <Pressable testID="pantry-clear" onPress={clearAll} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={14} color={theme.colors.onSurfaceMuted} />
            <Text style={styles.clearText}>Clear pantry</Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.saveWrap}>
        <PrimaryButton
          testID="pantry-save"
          label={`Save pantry${pantry.length ? ` • ${pantry.length}` : ""}`}
          onPress={save}
          icon={<Ionicons name="checkmark-circle" size={18} color={theme.colors.onBrand} />}
        />
      </View>

      {toast && (
        <View style={styles.toast} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.brand} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  eyebrow: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  h1: {
    fontFamily: "FrauncesBold",
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: theme.colors.onSurface,
  },
  h1Accent: { fontFamily: "FrauncesItalic", color: theme.colors.brand },
  statPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandTint,
    marginTop: 14,
  },
  statText: { fontFamily: "GeistBold", fontSize: 12, color: theme.colors.brandDeep, letterSpacing: 0.4 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    height: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Geist",
    fontSize: 14,
    color: theme.colors.onSurface,
    paddingVertical: 0,
  },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: "FrauncesBold", fontSize: 20, color: theme.colors.onSurface, letterSpacing: -0.4 },
  sectionMeta: { fontFamily: "GeistMedium", fontSize: 12, color: theme.colors.onSurfaceFaint, letterSpacing: 0.8 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  clearBtn: {
    alignSelf: "center",
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearText: { fontFamily: "GeistMedium", fontSize: 12, color: theme.colors.onSurfaceMuted },
  saveWrap: { position: "absolute", left: 20, right: 20, bottom: 96 },
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
