"""Backend API tests for Ruchio Smart Kitchen Companion."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://ruchio-ui-refresh.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health ---
class TestHealth:
    def test_root_ok(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data.get("message") == "Ruchio API alive"


# --- AI Chef ---
class TestAIChef:
    def test_ai_chef_success(self, api_client):
        payload = {
            "pantry": ["Chicken", "Rice", "Salt", "Onion", "Ghee"],
            "diet": "Non-Veg",
            "max_time": 30,
        }
        r = api_client.post(f"{BASE_URL}/api/ai-chef", json=payload, timeout=90)
        assert r.status_code == 200, f"Body: {r.text}"
        data = r.json()
        # Schema validation
        for key in ("id", "name", "ingredients", "instructions", "time", "tagline"):
            assert key in data, f"missing key {key}"
        assert isinstance(data["ingredients"], list) and len(data["ingredients"]) > 0
        assert isinstance(data["instructions"], list) and len(data["instructions"]) > 0
        assert isinstance(data["time"], int)
        assert isinstance(data["name"], str) and data["name"]
        assert isinstance(data["tagline"], str) and data["tagline"]

    def test_ai_chef_empty_pantry(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/ai-chef", json={"pantry": []}, timeout=15)
        assert r.status_code == 400
