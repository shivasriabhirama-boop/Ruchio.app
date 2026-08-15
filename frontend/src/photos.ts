import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type PhotoSource = "camera" | "library";

// Returns { uri } on success, { canceled: true }, or { blocked: true } if
// permission is permanently denied (caller should offer "Open Settings").
export async function captureDishPhoto(
  source: PhotoSource
): Promise<{ uri?: string; canceled?: boolean; blocked?: boolean }> {
  if (source === "camera") {
    const perm = await ImagePicker.getCameraPermissionsAsync();
    let status = perm.status;
    let canAskAgain = perm.canAskAgain;
    if (status !== "granted") {
      if (!canAskAgain) return { blocked: true };
      const req = await ImagePicker.requestCameraPermissionsAsync();
      status = req.status;
      if (status !== "granted") return req.canAskAgain ? { canceled: true } : { blocked: true };
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.[0]) return { canceled: true };
    return { uri: await persist(result.assets[0].uri) };
  }

  // library
  const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
  let status = perm.status;
  let canAskAgain = perm.canAskAgain;
  if (status !== "granted") {
    if (!canAskAgain) return { blocked: true };
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    status = req.status;
    if (status !== "granted") return req.canAskAgain ? { canceled: true } : { blocked: true };
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: true,
    aspect: [4, 3],
  });
  if (result.canceled || !result.assets?.[0]) return { canceled: true };
  return { uri: await persist(result.assets[0].uri) };
}

async function persist(uri: string): Promise<string> {
  // Web can't use FileSystem — just return the (blob) uri.
  if (Platform.OS === "web") return uri;
  try {
    const dir = `${FileSystem.documentDirectory}dish-photos/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    const ext = uri.split(".").pop()?.split("?")[0] || "jpg";
    const dest = `${dir}${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri;
  }
}
