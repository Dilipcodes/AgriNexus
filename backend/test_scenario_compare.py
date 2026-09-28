"""
AgriNexus - Test Suite for /api/scenario/compare
"""

import sys
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_scenario_rice_vs_maize_demo():
    print("\n--- Test 1: Rice vs Maize (DEMO Mode) ---")
    payload = {
        "crop_a": "rice",
        "crop_b": "maize",
        "district": "Gorakhpur",
        "mode": "DEMO"
    }
    resp = client.post("/api/scenario/compare", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()

    crop_a = data["crop_a"]
    crop_b = data["crop_b"]
    tradeoff = data["tradeoff"]

    # Verify basic identity
    assert crop_a["id"] == "rice"
    assert crop_b["id"] == "maize"

    # Verify no Net Profit is displayed anywhere
    json_dump = json.dumps(data).lower()
    assert "net profit" not in json_dump, "FAILED: 'Net Profit' found in response!"
    assert "net_profit" not in json_dump, "FAILED: 'net_profit' found in response!"

    # Verify fertilizer doses come from ICAR
    assert crop_a["fertilizer_guidance"]["recommendation"]["urea"] == "100–120 kg/ha"
    assert crop_b["fertilizer_guidance"]["recommendation"]["urea"] == "110–130 kg/ha"

    # Verify water saving calculation is deterministic
    # Rice midpoint: (700+1500)/2 = 1100, Maize midpoint: (450+900)/2 = 675. Diff = 425. Pct = 425/1100 = 38.6%
    assert tradeoff["water_saving_pct"] == 38.6, f"Expected 38.6%, got {tradeoff['water_saving_pct']}"
    assert "38.6%" in tradeoff["water_tradeoff"]

    # Verify duration difference
    # Rice midpoint: (120+135)/2 = 127.5, Maize midpoint: (90+105)/2 = 97.5. Diff = 30 days
    assert tradeoff["duration_diff_days"] == 30, f"Expected 30 days, got {tradeoff['duration_diff_days']}"

    # Verify economics: Target yield × Mandi price strictly
    y_min = crop_a["economics"]["target_yield_min"]
    y_max = crop_a["economics"]["target_yield_max"]
    modal_p = crop_a["economics"]["mandi_modal_price"]
    assert crop_a["economics"]["gross_revenue_min"] == round(y_min * modal_p)
    assert crop_a["economics"]["gross_revenue_max"] == round(y_max * modal_p)

    # Verify provenance
    assert crop_a["economics"]["provenance"]["status"] == "demo"
    assert data["provenance_summary"]["soil"]["status"] == "estimated"

    print("PASS: Rice vs Maize (DEMO) verified.")


def test_scenario_rice_vs_wheat_real():
    print("\n--- Test 2: Rice vs Wheat (REAL Mode) ---")
    payload = {
        "crop_a": "rice",
        "crop_b": "wheat",
        "district": "Gorakhpur",
        "mode": "REAL"
    }
    resp = client.post("/api/scenario/compare", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()

    crop_a = data["crop_a"]
    crop_b = data["crop_b"]
    tradeoff = data["tradeoff"]

    assert crop_a["name"] == "Rice"
    assert crop_b["name"] == "Wheat"
    assert "net_profit" not in json.dumps(data).lower()

    # Wheat duration: 115-125 days; Rice duration: 120-135 days
    assert crop_b["duration"]["label"] == "115–125 Days"
    assert crop_a["duration"]["label"] == "120–135 Days"

    modal_a_num = crop_a['economics']['mandi_modal_price']
    modal_b_num = crop_b['economics']['mandi_modal_price']
    print(f"Price A Numeric: {modal_a_num}, Status: {crop_a['economics']['provenance']['status']}")
    print(f"Price B Numeric: {modal_b_num}, Status: {crop_b['economics']['provenance']['status']}")
    print("PASS: Rice vs Wheat (REAL) verified.")


def test_scenario_maize_vs_wheat():
    print("\n--- Test 3: Maize vs Wheat ---")
    payload = {
        "crop_a": "maize",
        "crop_b": "wheat",
        "district": "Gorakhpur",
        "mode": "DEMO"
    }
    resp = client.post("/api/scenario/compare", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()

    crop_a = data["crop_a"]
    crop_b = data["crop_b"]

    assert crop_a["name"] == "Maize"
    assert crop_b["name"] == "Wheat"
    assert crop_a["economics"]["target_yield_label"] == "50–60 Qtl/ha"
    assert crop_b["economics"]["target_yield_label"] == "40–50 Qtl/ha"

    print("PASS: Maize vs Wheat verified.")


def test_scenario_with_verified_soil_card():
    print("\n--- Test 4: Rice vs Maize with Verified Soil Card (STCR Calibration) ---")
    payload = {
        "crop_a": "rice",
        "crop_b": "maize",
        "district": "Gorakhpur",
        "mode": "DEMO",
        "card_verified": True,
        "soil_ph": 7.2,
        "soil_n": 240.0, # Low Nitrogen (<280) -> +25% Urea adjustment!
        "soil_p": 8.5,   # Low Phosphorus (<10) -> +25% DAP adjustment!
        "soil_k": 210.0
    }
    resp = client.post("/api/scenario/compare", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()

    crop_a = data["crop_a"]
    fg_a = crop_a["fertilizer_guidance"]

    # STCR +25% adjustment check
    # Base urea for rice: 100-120 -> +25% = 125-150 kg/ha!
    assert fg_a["is_soil_test_calibrated"] is True
    assert fg_a["recommendation"]["urea"] == "125–150 kg/ha"
    assert fg_a["provenance"]["status"] == "verified"
    assert data["field_context"]["is_card_verified"] is True

    print("PASS: STCR Fertilizer calibration correctly applied to scenario comparison.")


if __name__ == "__main__":
    test_scenario_rice_vs_maize_demo()
    test_scenario_rice_vs_wheat_real()
    test_scenario_maize_vs_wheat()
    test_scenario_with_verified_soil_card()
    print("\nALL BACKEND SCENARIO COMPARISON TESTS PASSED SUCCESSFULLY!")
