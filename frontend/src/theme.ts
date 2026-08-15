export const theme = {
  colors: {
    // Light, cream daily-use palette
    surface: "#F4EFE6", // plain creme page background
    surface2: "#FFFFFF", // cards
    surface3: "#FBF8F1", // warm off-white
    surface4: "#EFEAE0", // subtle raised
    onSurface: "#161616", // near-black text
    onSurfaceMuted: "#5C5A54",
    onSurfaceFaint: "#9B978D",
    brand: "#4F46E5", // indigo
    brandDeep: "#3730A3",
    brandTint: "#ECEBFB", // light indigo wash
    onBrand: "#FFFFFF",
    success: "#2E7D32",
    successTint: "#E6F1E6",
    warning: "#B26A00",
    error: "#C0392B",
    errorTint: "#FBE9E7",
    border: "#E7DFCF", // warm cream border
    borderStrong: "#D5CBB6",
    divider: "#EDE7DA",
    // For text/badges that sit on top of dark food photos
    onImage: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 28,
    pill: 999,
  },
  font: {
    display: "Fraunces",
    displayItalic: "FrauncesItalic",
    body: "Geist",
    bodyMedium: "GeistMedium",
    bodyBold: "GeistBold",
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 30,
    "3xl": 38,
    "4xl": 52,
  },
};

export type Theme = typeof theme;
