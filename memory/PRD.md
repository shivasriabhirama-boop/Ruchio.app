# RUCHIO — Smart Kitchen Companion (Product Requirements)

## What it is
A premium mobile Expo app that recommends home-style Indian recipes based on the user's pantry. Includes a personalised onboarding quiz, pantry manager, curated recipe feed with pantry-match scoring, an AI Chef feature powered by an LLM, favorites, and profile management.

## Tech
- Expo Router (file-based)
- React Native (dark, glassy, editorial UI)
- expo-font (Fraunces + Geist loaded from fontsource CDN — NOT @expo-google-fonts)
- expo-blur, expo-image, expo-linear-gradient, expo-haptics
- AsyncStorage for profile/pantry/favorites
- FastAPI backend at `/api/ai-chef` for LLM-driven recipe generation
- Emergent LLM key + emergentintegrations (Gemini 3 Flash Preview)

## Screens
- `/onboarding` — 4-step quiz (welcome, basics, avoid, craving)
- `/(tabs)/index` — Discover feed with meal chip filter, surprise CTA
- `/(tabs)/pantry` — categorised ingredient chips, save button, search
- `/(tabs)/ai-chef` — vibe chips, freeform craving, LLM recipe
- `/(tabs)/profile` — profile editing, retake quiz
- `/saved` — favorites list
- `/recipe/[id]` — hero image + Have/Need split + steps

## Backend endpoints
- `GET  /api/` → health
- `POST /api/ai-chef` → { pantry, max_time, diet, avoid, craving? } → structured AI recipe

## Design system
"6 Glass / Luxe DARK" — `#0F0F0F` surface, `#FF9F1C` saffron brand, Fraunces display + Geist body, 3-stop gradient scrims over food photography, glass BlurView bottom tab bar.
