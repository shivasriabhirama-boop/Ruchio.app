import AsyncStorage from "@react-native-async-storage/async-storage";

export type Profile = {
  name: string;
  age: number;
  habits: "Non-Veg" | "Veg" | "Vegan" | "Jain";
  avoid: string[];
  quizPref: string;
  onboarded: boolean;
};

const KEYS = {
  profile: "ruchio.profile",
  pantry: "ruchio.pantry",
  favorites: "ruchio.favorites",
  aiRecipes: "ruchio.ai_recipes",
};

export const defaultProfile: Profile = {
  name: "",
  age: 25,
  habits: "Non-Veg",
  avoid: [],
  quizPref: "",
  onboarded: false,
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getProfile: () => readJSON<Profile>(KEYS.profile, defaultProfile),
  setProfile: (p: Profile) => writeJSON(KEYS.profile, p),
  getPantry: () => readJSON<string[]>(KEYS.pantry, []),
  setPantry: (p: string[]) => writeJSON(KEYS.pantry, p),
  getFavorites: () => readJSON<string[]>(KEYS.favorites, []),
  setFavorites: (f: string[]) => writeJSON(KEYS.favorites, f),
  getAIRecipes: () => readJSON<any[]>(KEYS.aiRecipes, []),
  setAIRecipes: (r: any[]) => writeJSON(KEYS.aiRecipes, r),
};
