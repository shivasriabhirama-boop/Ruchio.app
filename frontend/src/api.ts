const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export type AIRecipe = {
  id: string;
  name: string;
  region: string;
  meal: string;
  time: number;
  spice: string;
  diet: string;
  ingredients: string[];
  instructions: string[];
  tagline: string;
};

export async function generateAIRecipe(payload: {
  pantry: string[];
  max_time: number;
  diet: string;
  avoid: string[];
  craving?: string;
}): Promise<AIRecipe> {
  const res = await fetch(`${BACKEND_URL}/api/ai-chef`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "AI chef failed");
  }
  return res.json();
}
