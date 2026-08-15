import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { theme } from "@/src/theme";
import { storage, Profile, defaultProfile } from "@/src/storage";
import { ALL_INGREDIENTS } from "@/src/data/recipes";
import { Chip, PrimaryButton } from "@/src/ui";

const HABITS = ["Non-Veg", "Veg", "Vegan", "Jain"] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [favCount, setFavCount] = useState(0);
  const [pantryCount, setPantryCount] = useState(0);
  const [shopCount, setShopCount] = useState(0);
  const [showAvoid, setShowAvoid] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        storage.getProfile(),
        storage.getFavorites(),
        storage.getPantry(),
        storage.getShopping(),
      ]).then(([p, f, pt, s]) => {
        setProfile(p);
        setFavCount(f.length);
        setPantryCount(pt.length);
        setShopCount(s.filter((i) => !i.checked).length);
      });
    }, [])
  );

  const update = <K extends keyof Profile>(key: K, val: Profile[K]) => {
    const next = { ...profile, [key]: val };
    setProfile(next);
    storage.setProfile(next);
  };

  const toggleAvoid = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const has = profile.avoid.includes(item);
    update("avoid", has ? profile.avoid.filter((i) => i !== item) : [...profile.avoid, item]);
  };

  const retake = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await storage.setProfile({ ...profile, onboarded: false });
    router.replace("/onboarding");
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.h1}>
            Hello,{"\n"}
            <Text style={styles.h1Accent}>{profile.name || "friend"}.</Text>
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Saved" value={favCount} icon="heart" onPress={() => router.push("/saved")} />
          <StatCard label="Pantry" value={pantryCount} icon="basket" onPress={() => router.push("/(tabs)/pantry")} />
          <StatCard label="List" value={shopCount} icon="cart" onPress={() => router.push("/shopping")} />
        </View>

        <SectionTitle>Basics</SectionTitle>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            testID="profile-name"
            style={styles.input}
            value={profile.name}
            onChangeText={(t) => update("name", t)}
            placeholder="Your name"
            placeholderTextColor={theme.colors.onSurfaceFaint}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            testID="profile-age"
            style={styles.input}
            value={String(profile.age)}
            onChangeText={(t) => update("age", Number(t.replace(/[^0-9]/g, "")) || 0)}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="25"
            placeholderTextColor={theme.colors.onSurfaceFaint}
          />
        </View>

        <SectionTitle>Eating style</SectionTitle>
        <View style={styles.chipWrap}>
          {HABITS.map((h) => (
            <Chip
              key={h}
              testID={`profile-habit-${h}`}
              label={h}
              selected={profile.habits === h}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                update("habits", h);
              }}
            />
          ))}
        </View>

        <SectionTitle>Avoid ingredients</SectionTitle>
        <Pressable testID="toggle-avoid" onPress={() => setShowAvoid((s) => !s)} style={styles.avoidToggle}>
          <Text style={styles.avoidToggleText}>
            {profile.avoid.length === 0 ? "None" : `${profile.avoid.length} selected`}
          </Text>
          <Ionicons name={showAvoid ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.onSurface} />
        </Pressable>
        {showAvoid && (
          <View style={[styles.chipWrap, { marginTop: 12 }]}>
            {ALL_INGREDIENTS.map((i) => (
              <Chip
                key={i}
                testID={`profile-avoid-${i}`}
                label={i}
                selected={profile.avoid.includes(i)}
                onPress={() => toggleAvoid(i)}
              />
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
          <PrimaryButton
            testID="retake-onboarding"
            label="Retake onboarding quiz"
            onPress={retake}
            icon={<Ionicons name="refresh" size={18} color={theme.colors.onBrand} />}
          />
        </View>

        <Text style={styles.foot}>Ruchio • Smart Kitchen Companion</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function StatCard({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`stat-${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={15} color={theme.colors.brand} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  eyebrow: {
    fontFamily: "GeistMedium",
    fontSize: 12,
    letterSpacing: 1.5,
    color: theme.colors.brand,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  h1: { fontFamily: "FrauncesBold", fontSize: 38, lineHeight: 40, letterSpacing: -1.2, color: theme.colors.onSurface },
  h1Accent: { fontFamily: "FrauncesItalic", color: theme.colors.brand },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginTop: 12 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontFamily: "FrauncesBold", fontSize: 26, color: theme.colors.onSurface },
  statLabel: {
    fontFamily: "GeistMedium",
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.onSurfaceFaint,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: "GeistBold",
    fontSize: 11,
    letterSpacing: 1.8,
    color: theme.colors.brand,
    textTransform: "uppercase",
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 12,
  },
  field: { paddingHorizontal: 20, marginBottom: 12 },
  fieldLabel: { fontFamily: "GeistMedium", fontSize: 12, color: theme.colors.onSurfaceFaint, marginBottom: 6, letterSpacing: 0.4 },
  input: {
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
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  avoidToggle: {
    marginHorizontal: 20,
    height: 50,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avoidToggleText: { fontFamily: "GeistMedium", fontSize: 14, color: theme.colors.onSurface },
  foot: {
    fontFamily: "FrauncesItalic",
    fontSize: 12,
    color: theme.colors.onSurfaceFaint,
    textAlign: "center",
    marginTop: 36,
  },
});
