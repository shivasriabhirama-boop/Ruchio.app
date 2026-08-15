import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Share,
  Platform,
} from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { storage, ShoppingItem, mergeShopping } from "@/src/storage";

export default function Shopping() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [draft, setDraft] = useState("");

  const load = useCallback(async () => {
    setItems(await storage.getShopping());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const persist = async (next: ShoppingItem[]) => {
    setItems(next);
    await storage.setShopping(next);
  };

  const toggle = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    persist(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  const remove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    persist(items.filter((i) => i.id !== id));
  };

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    persist(mergeShopping(items, [name]));
    setDraft("");
  };

  const clearChecked = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    persist(items.filter((i) => !i.checked));
  };

  const share = async () => {
    if (items.length === 0) return;
    const text =
      "🛒 Ruchio Shopping List\n\n" +
      items.map((i) => `${i.checked ? "☑" : "◻"} ${i.name}`).join("\n");
    try {
      await Share.share(Platform.OS === "ios" ? { message: text } : { message: text, title: "Shopping List" });
    } catch {}
  };

  const remaining = items.filter((i) => !i.checked).length;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable testID="shopping-back" onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>Shopping List</Text>
          <Text style={styles.title}>{remaining} to buy</Text>
        </View>
        <Pressable testID="shopping-share" onPress={share} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={20} color={theme.colors.brand} />
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput
          testID="shopping-input"
          style={styles.addInput}
          value={draft}
          onChangeText={setDraft}
          placeholder="Add an item"
          placeholderTextColor={theme.colors.onSurfaceFaint}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <Pressable testID="shopping-add" onPress={add} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={theme.colors.onBrand} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cart-outline" size={40} color={theme.colors.brand} />
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptyBody}>
              Add items here, or tap “Add to list” from any recipe’s missing ingredients.
            </Text>
          </View>
        ) : (
          <>
            {items.map((i) => (
              <View key={i.id} style={styles.row} testID={`shopping-item-${i.id}`}>
                <Pressable
                  testID={`shopping-toggle-${i.id}`}
                  onPress={() => toggle(i.id)}
                  hitSlop={8}
                  style={[styles.check, i.checked && styles.checkOn]}
                >
                  {i.checked && <Ionicons name="checkmark" size={15} color={theme.colors.onBrand} />}
                </Pressable>
                <Text style={[styles.itemText, i.checked && styles.itemTextChecked]}>{i.name}</Text>
                <Pressable testID={`shopping-remove-${i.id}`} onPress={() => remove(i.id)} hitSlop={8}>
                  <Ionicons name="close" size={18} color={theme.colors.onSurfaceFaint} />
                </Pressable>
              </View>
            ))}

            {items.some((i) => i.checked) && (
              <Pressable testID="shopping-clear-checked" onPress={clearChecked} style={styles.clearBtn}>
                <Ionicons name="trash-outline" size={14} color={theme.colors.onSurfaceMuted} />
                <Text style={styles.clearText}>Clear checked items</Text>
              </Pressable>
            )}
          </>
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
  addRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 4 },
  addInput: {
    flex: 1,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    fontFamily: "Geist",
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", padding: 32, gap: 8 },
  emptyTitle: { fontFamily: "FrauncesBold", fontSize: 20, color: theme.colors.onSurface },
  emptyBody: { fontFamily: "Geist", fontSize: 13, color: theme.colors.onSurfaceMuted, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  itemText: { flex: 1, fontFamily: "GeistMedium", fontSize: 15, color: theme.colors.onSurface },
  itemTextChecked: { textDecorationLine: "line-through", color: theme.colors.onSurfaceFaint },
  clearBtn: {
    alignSelf: "center",
    marginTop: 16,
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
});
