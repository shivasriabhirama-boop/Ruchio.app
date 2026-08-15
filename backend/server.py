from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI()
api_router = APIRouter(prefix="/api")


class AIChefRequest(BaseModel):
    pantry: List[str] = Field(default_factory=list)
    max_time: int = 45
    diet: str = "Non-Veg"
    avoid: List[str] = Field(default_factory=list)
    craving: Optional[str] = None


class AIChefRecipe(BaseModel):
    id: str
    name: str
    region: str
    meal: str
    time: int
    spice: str
    diet: str
    ingredients: List[str]
    instructions: List[str]
    tagline: str


@api_router.get("/")
async def root():
    return {"message": "Ruchio API alive"}


@api_router.post("/ai-chef", response_model=AIChefRecipe)
async def ai_chef(req: AIChefRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    if not req.pantry:
        raise HTTPException(status_code=400, detail="Pantry is empty")

    # Import lazily so import-time doesn't fail if lib missing in some env
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system_message = (
        "You are Ruchio, an expert Indian home-style chef. "
        "Given a user's pantry and preferences, invent ONE original, delicious, doable recipe. "
        "Respond ONLY with valid JSON matching this exact schema — no prose, no code fences:\n"
        "{\n"
        '  "name": "<catchy dish name>",\n'
        '  "region": "<region or Fusion>",\n'
        '  "meal": "Breakfast|Lunch|Dinner|Snack",\n'
        '  "time": <total minutes as int>,\n'
        '  "spice": "Mild|Medium|Hot",\n'
        '  "diet": "Veg|Non-Veg|Vegan|Jain",\n'
        '  "ingredients": ["<ingredient with quantity>", ...],\n'
        '  "instructions": ["step 1", "step 2", ...],\n'
        '  "tagline": "<one-sentence hook>"\n'
        "}"
    )

    prompt = (
        f"Pantry: {', '.join(req.pantry)}\n"
        f"Max cooking time: {req.max_time} minutes\n"
        f"Dietary preference: {req.diet}\n"
        f"Ingredients to avoid: {', '.join(req.avoid) if req.avoid else 'none'}\n"
        f"Craving / vibe: {req.craving or 'anything comforting'}\n\n"
        "Use mostly what's in the pantry. Return ONLY JSON."
    )

    session_id = f"ruchio-{uuid.uuid4()}"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model("gemini", "gemini-3-flash-preview")

    try:
        response_text = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logging.exception("LLM error")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    text = (response_text or "").strip()
    # Strip code fences if present
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    # Grab the first {...} block
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="LLM returned invalid JSON")

    steps = data.get("instructions", [])
    if isinstance(steps, str):
        steps = [s.strip() for s in steps.split("\n") if s.strip()]

    recipe = AIChefRecipe(
        id=f"ai-{uuid.uuid4().hex[:8]}",
        name=data.get("name", "Chef's Special"),
        region=data.get("region", "Fusion"),
        meal=data.get("meal", "Dinner"),
        time=int(data.get("time", req.max_time)),
        spice=data.get("spice", "Medium"),
        diet=data.get("diet", req.diet),
        ingredients=data.get("ingredients", req.pantry),
        instructions=steps or ["Combine ingredients and cook to taste."],
        tagline=data.get("tagline", "A dish crafted just for your pantry."),
    )
    return recipe


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
