import AsyncStorage from "@react-native-async-storage/async-storage";

export type Profile = {
  name: string;
  age: number;
  habits: "Non-Veg" | "Veg" | "Vegan" | "Jain";
  avoid: string[];
  quizPref: string;
  onboarded: boolean;
};

export type ShoppingItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type MenuDay = {
  day: string;
  recipeId: string | null;
};

export type Rating = {
  stars: number; // 1-5
  note: string;
  updatedAt: string;
};

const KEYS = {
  profile: "ruchio.profile",
  pantry: "ruchio.pantry",
  favorites: "ruchio.favorites",
  aiRecipes: "ruchio.ai_recipes",
  shopping: "ruchio.shopping",
  photos: "ruchio.photos",
  menu: "ruchio.menu",
  ratings: "ruchio.ratings",
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

  // Shopping list
  getShopping: () => readJSON<ShoppingItem[]>(KEYS.shopping, []),
  setShopping: (s: ShoppingItem[]) => writeJSON(KEYS.shopping, s),

  // Recipe photos (recipeId -> local uri)
  getPhotos: () => readJSON<Record<string, string>>(KEYS.photos, {}),
  setPhotos: (p: Record<string, string>) => writeJSON(KEYS.photos, p),

  // Weekly menu
  getMenu: () => readJSON<MenuDay[]>(KEYS.menu, []),
  setMenu: (m: MenuDay[]) => writeJSON(KEYS.menu, m),

  // Recipe ratings (recipeId -> Rating)
  getRatings: () => readJSON<Record<string, Rating>>(KEYS.ratings, {}),
  setRatings: (r: Record<string, Rating>) => writeJSON(KEYS.ratings, r),
};

export function mergeShopping(existing: ShoppingItem[], names: string[]): ShoppingItem[] {
  const lowerExisting = new Set(existing.map((i) => i.name.toLowerCase()));
  const additions = names
    .filter((n) => !lowerExisting.has(n.toLowerCase()))
    .map((n) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: n,
      checked: false,
    }));
  return [...existing, ...additions];
}
