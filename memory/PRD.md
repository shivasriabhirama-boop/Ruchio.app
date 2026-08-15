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
"Cream Daylight" — `#F4EFE6` cream page background, white cards, near-black `#161616` ink text, `#4F46E5` indigo accent + `#ECEBFB` indigo wash. Fraunces display + Geist body. Food photos kept on recipe cards/detail with dark scrims + white text. Light glassless bottom tab bar.

## Navigation (v2)
- Tabs (4): Discover, Planner (Weekly Menu), Pantry, Profile
- Stack screens: /ai-chef (AI Chef), /shopping (Shopping List), /cook/[id] (Cook Mode), /saved, /recipe/[id]

## Features added (v2 — 2026-08-15)
- **Shopping List** (`/shopping`): tickable + shareable; "Add N to shopping list" from a recipe's You-need items; Planner "add week's items". Stored in AsyncStorage.
- **Cook Mode** (`/cook/[id]`): full-screen big step text, progress bar, per-step countdown timer (play/pause, ±1m, reset), keep-awake on native (web-guarded).
- **Recipe Photos**: snap/pick a finished-dish photo (expo-image-picker + expo-file-system persist), shown on recipe detail + saved list. Native-only capture.
- **Weekly Menu** (Planner tab): smart 7-day plan from pantry match scores + profile; per-day shuffle, regenerate, add week to shopping list.

