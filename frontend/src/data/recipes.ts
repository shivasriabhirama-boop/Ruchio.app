export type Recipe = {
  id: string;
  name: string;
  region: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  time: number;
  spice: "Mild" | "Medium" | "Hot";
  diet: "Veg" | "Non-Veg" | "Vegan" | "Jain";
  ingredients: string[];
  simplicity: number;
  instructions: string[];
  image: string;
  tagline: string;
};

export const ALL_INGREDIENTS = [
  "Chicken", "Eggs", "Mutton", "Prawns", "Fish", "Paneer", "Keema",
  "Rice", "Basmati Rice", "Wheat Flour (Atta)", "Bread", "Rava (Sooji)", "Poha",
  "Tomato", "Onion", "Potato", "Garlic", "Ginger", "Green Chili", "Coriander Leaves", "Mint Leaves",
  "Lemon", "Curd (Yogurt)", "Milk", "Cheese", "Butter", "Ghee", "Oil",
  "Salt", "Sugar", "Turmeric Powder", "Red Chili Powder", "Garam Masala", "Cumin Seeds",
  "Coriander Powder", "Black Pepper", "Mustard Seeds", "Curry Leaves", "Water",
];

export const INGREDIENT_CATEGORIES: { title: string; items: string[] }[] = [
  { title: "Proteins", items: ["Chicken", "Eggs", "Mutton", "Prawns", "Fish", "Paneer", "Keema"] },
  { title: "Grains & Staples", items: ["Rice", "Basmati Rice", "Wheat Flour (Atta)", "Bread", "Rava (Sooji)", "Poha"] },
  { title: "Vegetables & Herbs", items: ["Tomato", "Onion", "Potato", "Garlic", "Ginger", "Green Chili", "Coriander Leaves", "Mint Leaves", "Curry Leaves", "Lemon"] },
  { title: "Dairy & Fats", items: ["Curd (Yogurt)", "Milk", "Cheese", "Butter", "Ghee", "Oil"] },
  { title: "Spices & Seasonings", items: ["Salt", "Sugar", "Turmeric Powder", "Red Chili Powder", "Garam Masala", "Cumin Seeds", "Coriander Powder", "Black Pepper", "Mustard Seeds"] },
  { title: "Others", items: ["Water"] },
];

const IMG = {
  butterChicken: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  chickenRice: "https://images.unsplash.com/photo-1596797038530-2c107229654b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  eggs: "https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  scrambled: "https://images.unsplash.com/photo-1608039755401-742074f0548d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  friedRice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  paneer: "https://images.unsplash.com/photo-1626500155404-c00a0b6b7e75?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  broth: "https://images.unsplash.com/photo-1547592180-85f173990554?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  poha: "https://images.unsplash.com/photo-1626082927389-6cd097cee6a6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
  daal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1080",
};

export const ALL_RECIPES: Recipe[] = [
  {
    id: "simple_chicken_rice",
    name: "One-Pot Chicken Rice",
    region: "Home-style",
    meal: "Lunch",
    time: 20,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Chicken", "Rice", "Salt", "Water"],
    simplicity: 1,
    tagline: "Comfort in a single pot, ready before your show ends.",
    instructions: [
      "In a heavy pot, combine chicken pieces, rice, water, and salt.",
      "Cover and simmer on medium heat for 20 minutes.",
      "Rest 5 minutes off the heat, fluff and serve.",
    ],
    image: IMG.chickenRice,
  },
  {
    id: "pan_seared_chicken",
    name: "Pan-Seared Chicken",
    region: "Home-style",
    meal: "Lunch",
    time: 15,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Chicken", "Oil", "Salt"],
    simplicity: 1,
    tagline: "Crackling skin, tender inside — three ingredients only.",
    instructions: [
      "Pat chicken dry and season generously with salt.",
      "Heat oil in a skillet till shimmering.",
      "Sear 5–6 minutes per side until deep golden and cooked through.",
    ],
    image: IMG.chicken,
  },
  {
    id: "simple_chicken_soup",
    name: "Minimalist Chicken Broth",
    region: "Home-style",
    meal: "Dinner",
    time: 25,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Chicken", "Water", "Salt"],
    simplicity: 1,
    tagline: "A soothing bowl for rainy evenings.",
    instructions: [
      "Add chicken pieces to a pot with cold water and a pinch of salt.",
      "Bring to a boil, skim foam, then simmer for 25 minutes.",
      "Strain and season to taste.",
    ],
    image: IMG.broth,
  },
  {
    id: "simple_boiled_eggs",
    name: "Classic Boiled Eggs",
    region: "Quick & Easy",
    meal: "Breakfast",
    time: 10,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Eggs", "Water", "Salt"],
    simplicity: 1,
    tagline: "Golden yolk, pinch of salt — breakfast solved.",
    instructions: [
      "Place eggs in a saucepan, cover with cold water.",
      "Boil 8–10 minutes, plunge into ice water.",
      "Peel and finish with flaky salt.",
    ],
    image: IMG.eggs,
  },
  {
    id: "simple_scrambled_eggs",
    name: "Homestyle Scrambled Eggs",
    region: "Quick & Easy",
    meal: "Breakfast",
    time: 5,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Eggs", "Butter", "Salt"],
    simplicity: 1,
    tagline: "Slow, buttery, cloud-soft curds.",
    instructions: [
      "Whisk eggs with a pinch of salt.",
      "Melt butter in a cold pan, add eggs on low heat.",
      "Stir slowly with a spatula until just set.",
    ],
    image: IMG.scrambled,
  },
  {
    id: "egg_fried_rice",
    name: "Homestyle Egg Fried Rice",
    region: "Asian Fusion",
    meal: "Lunch",
    time: 15,
    spice: "Mild",
    diet: "Non-Veg",
    ingredients: ["Eggs", "Rice", "Oil", "Salt"],
    simplicity: 2,
    tagline: "Wok-tossed, fridge-clearing magic.",
    instructions: [
      "Scramble eggs in oil, break into small curds, set aside.",
      "Toss cooked rice in the hot pan till slightly crispy.",
      "Fold in eggs, salt to taste, serve hot.",
    ],
    image: IMG.friedRice,
  },
  {
    id: "butter_chicken",
    name: "Delhi Butter Chicken",
    region: "North India",
    meal: "Dinner",
    time: 40,
    spice: "Medium",
    diet: "Non-Veg",
    ingredients: ["Chicken", "Tomato", "Onion", "Butter", "Garlic", "Ginger", "Garam Masala", "Salt"],
    simplicity: 4,
    tagline: "The velvety classic, worth the effort.",
    instructions: [
      "Marinate chicken in yoghurt, ginger-garlic and spices for 20 minutes.",
      "Sear chicken in butter until golden; set aside.",
      "Blend cooked tomatoes and onions into a smooth makhani gravy.",
      "Simmer chicken in the gravy with garam masala and finish with a knob of butter.",
    ],
    image: IMG.butterChicken,
  },
  {
    id: "paneer_bhurji",
    name: "Spiced Paneer Bhurji",
    region: "North India",
    meal: "Breakfast",
    time: 15,
    spice: "Medium",
    diet: "Veg",
    ingredients: ["Paneer", "Onion", "Tomato", "Green Chili", "Oil", "Salt"],
    simplicity: 2,
    tagline: "Punjabi cafés' favourite morning scramble.",
    instructions: [
      "Sauté onions till pink, add green chilli and tomatoes.",
      "Crumble paneer into the pan, add salt and a pinch of turmeric.",
      "Toss briskly for 3 minutes, finish with coriander.",
    ],
    image: IMG.paneer,
  },
  {
    id: "poha",
    name: "Kanda Poha",
    region: "Maharashtra",
    meal: "Breakfast",
    time: 15,
    spice: "Mild",
    diet: "Veg",
    ingredients: ["Poha", "Onion", "Mustard Seeds", "Turmeric Powder", "Green Chili", "Curry Leaves", "Oil", "Salt", "Lemon"],
    simplicity: 2,
    tagline: "Fluffy, tangy, five minutes to smile.",
    instructions: [
      "Rinse poha till soft, drain.",
      "Temper mustard seeds, curry leaves, green chilli in oil.",
      "Add onions, then poha, turmeric and salt. Toss.",
      "Finish with lemon and coriander.",
    ],
    image: IMG.poha,
  },
];

export const MEAL_FILTERS: (Recipe["meal"] | "All")[] = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];
