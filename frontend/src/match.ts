import { ALL_RECIPES, Recipe } from "./data/recipes";
import { Profile } from "./storage";

export type Match = {
  recipe: Recipe;
  score: number;
  matching: string[];
  missing: string[];
  matchType: "Perfect" | "Close" | "Other";
};

export function scoreRecipes(
  pantry: string[],
  profile: Profile,
  mealFilter: string = "All",
  ratings: Record<string, { stars: number }> = {}
): Match[] {
  const pantrySet = new Set(pantry);
  const avoidSet = new Set(profile.avoid);

  const results: Match[] = [];
  for (const r of ALL_RECIPES) {
    if (mealFilter !== "All" && r.meal !== mealFilter) continue;
    const recipeSet = new Set(r.ingredients);
    if ([...recipeSet].some((x) => avoidSet.has(x))) continue;

    const matching = r.ingredients.filter((x) => pantrySet.has(x));
    const missing = r.ingredients.filter((x) => !pantrySet.has(x));
    const base = (matching.length / r.ingredients.length) * 100;
    const quizBoost =
      profile.quizPref && r.name.toLowerCase().includes(profile.quizPref.toLowerCase()) ? 50 : 0;
    const simplicityBoost = pantry.length <= 3 ? (5 - r.simplicity) * 8 : 0;
    const ratingBoost = (ratings[r.id]?.stars || 0) * 14; // highly-rated dishes rise up
    const score = base + quizBoost + simplicityBoost + ratingBoost;
    const matchType: Match["matchType"] =
      missing.length === 0 ? "Perfect" : missing.length <= 2 ? "Close" : "Other";
    results.push({ recipe: r, score, matching, missing, matchType });
  }

  results.sort((a, b) => b.score - a.score || a.missing.length - b.missing.length);
  return results;
}

// Leftover Mode: fast dishes that use only a couple of ingredients you (mostly) have.
export function leftoverMatches(
  pantry: string[],
  profile: Profile,
  ratings: Record<string, { stars: number }> = {}
): Match[] {
  return scoreRecipes(pantry, profile, "All", ratings).filter(
    (m) => m.recipe.time <= 25 && m.recipe.ingredients.length <= 4 && m.missing.length <= 1
  );
}
