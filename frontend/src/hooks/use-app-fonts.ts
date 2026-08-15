import { useFonts } from "expo-font";

// Load custom fonts via URL from fontsource CDN (TTF).
// We deliberately do NOT use @expo-google-fonts packages.
export const useAppFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    Fraunces:
      "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-500-normal.ttf",
    FrauncesBold:
      "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-700-normal.ttf",
    FrauncesItalic:
      "https://cdn.jsdelivr.net/fontsource/fonts/fraunces@latest/latin-500-italic.ttf",
    Geist:
      "https://cdn.jsdelivr.net/fontsource/fonts/geist@latest/latin-400-normal.ttf",
    GeistMedium:
      "https://cdn.jsdelivr.net/fontsource/fonts/geist@latest/latin-500-normal.ttf",
    GeistBold:
      "https://cdn.jsdelivr.net/fontsource/fonts/geist@latest/latin-700-normal.ttf",
  });
