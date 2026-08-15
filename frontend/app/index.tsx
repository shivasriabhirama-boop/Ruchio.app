import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import { storage } from "@/src/storage";
import { theme } from "@/src/theme";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await storage.getProfile();
      if (!mounted) return;
      if (p.onboarded) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={theme.colors.brand} />
    </View>
  );
}
