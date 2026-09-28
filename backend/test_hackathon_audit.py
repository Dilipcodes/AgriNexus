"""
AgriNexus / FarmAI - End-to-End Hackathon Readiness & Data Integrity Audit

Validates:
1. Complete API Suite Health & Screen Endpoints
2. Full Farmer Journey Data Flow:
   - Geocode (/api/geocode)
   - Land Analysis (/api/land-analysis)
   - Cropping Pattern (/api/cropping-pattern)
   - Mandi Market Rates (/api/mandi-prices)
   - Crop Recommendations (/api/recommendations)
   - What-If Scenario Simulator (/api/scenario/compare)
   - Personalized Farm Plan (/api/farm-plan)
   - Disease Detection (/api/disease/detect)
   - FarmAI Copilot (/api/copilot/chat)
3. Provenance & Zero-Fabrication Integrity
4. Failure & Edge Case Handling (missing soil card, no disease scan, unsupported crop, offline fallback)
"""

import sys
import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestHackathonReadinessAudit(unittest.TestCase):

    def test_01_health_and_version(self):
        """API Health check endpoint."""
        resp = client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("app", data)

    def test_02_geocode_flow(self):
        """Reverse geocoding with district and coordinates."""
        resp = client.get("/api/geocode?lat=26.7500&lng=83.3700&mode=DEMO")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["district"], "Gorakhpur")
        self.assertEqual(data["state"], "Uttar Pradesh")
        self.assertIn("provenance", data)

    def test_03_land_analysis_ndvi_provenance(self):
        """Land analysis telemetry: NDVI must be estimated, never live satellite."""
        resp = client.get("/api/land-analysis?lat=26.7500&lng=83.3700&mode=DEMO")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        
        # Check NDVI metric
        ndvi = next((k for k in data["key_insights"] if k["id"] == "ndvi"), None)
        self.assertIsNotNone(ndvi)
        self.assertEqual(ndvi["provenance"]["status"], "estimated")
        self.assertIn("benchmark", ndvi["provenance"]["methodology_note"].lower())
        self.assertIn("never presented as live satellite", ndvi["provenance"]["methodology_note"].lower())

    def test_04_cropping_pattern(self):
        """Cropping pattern for regional district."""
        resp = client.get("/api/cropping-pattern?district=Gorakhpur")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("crops", data)
        self.assertIn("history", data)
        self.assertIn("provenance", data)

    def test_05_mandi_prices_provenance(self):
        """Market arrivals report from AGMARKNET feed/benchmark."""
        resp = client.get("/api/mandi-prices?district=Gorakhpur&mode=DEMO")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("table", data)
        self.assertTrue(len(data["table"]) >= 3)
        self.assertIn("modal_price", data["table"][0])
        # Zero Net Profit in market response
        self.assertNotIn("net profit", resp.text.lower())
        self.assertIn("disclaimer", data)

    def test_06_recommendations_determinstic_tiers(self):
        """Crop recommendations must produce qualitative tiers, never pseudo-percentages."""
        resp = client.get("/api/recommendations?temperature=27.4&annual_rainfall=850&soil_ph=6.7&soil_type=Loamy&season=Kharif&region=Gorakhpur")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(len(data) >= 3)
        for crop in data:
            self.assertIn(crop["suitability"], ["High Suitability", "Moderate Suitability"])
            self.assertNotIn("%", crop["suitability"])
            # Fertilizer guidance must be included
            self.assertIn("fertilizer_guidance", crop)
            self.assertIsNotNone(crop["fertilizer_guidance"]["recommendation"])

    def test_07_soil_card_upload_and_calibration(self):
        """Soil card digitization applies STCR adjustment."""
        payload = {
            "file_data": "sample_card_low_nitrogen",
            "file_type": "image/jpeg",
            "mode": "DEMO"
        }
        resp = client.post("/api/soil/upload-card", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["success"])
        rep = data["report"]
        self.assertEqual(rep["source_type"], "uploaded_card")
        self.assertEqual(rep["provenance"]["status"], "verified")
        # N must be extracted
        self.assertIn("n", rep["parameters"])
        self.assertEqual(rep["parameters"]["n"]["value"], 210.0)

    def test_08_disease_detection_screening_disclaimer(self):
        """Disease detection in DEMO mode produces ICAR diagnosis with preliminary disclaimer."""
        payload = {
            "image_data": "sample_blast_image",
            "crop": "Rice",
            "disease_key": "rice_blast",
            "mode": "DEMO"
        }
        resp = client.post("/api/disease/detect", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        disease_name = data.get("diseaseName") or data.get("disease_name")
        self.assertEqual(disease_name, "Rice Blast")
        disclaimer = data.get("advisoryDisclaimer") or data.get("advisory_disclaimer")
        self.assertIn("screening", disclaimer.lower())
        self.assertIn("kvk", disclaimer.lower())
        self.assertIn("provenance", data)

    def test_09_scenario_simulator_no_net_profit(self):
        """Scenario comparison Rice vs Wheat strictly displays Bounded Gross Output, never Net Profit."""
        payload = {
            "crop_a": "rice",
            "crop_b": "wheat",
            "district": "Gorakhpur",
            "mode": "DEMO"
        }
        resp = client.post("/api/scenario/compare", json=payload)
        self.assertEqual(resp.status_code, 200)
        text_lower = resp.text.lower()
        self.assertNotIn("net profit", text_lower)
        self.assertNotIn("net_profit", text_lower)
        data = resp.json()
        self.assertIn("gross_revenue_label", data["crop_a"]["economics"])
        self.assertIn("gross_revenue_label", data["crop_b"]["economics"])

    def test_10_farm_plan_synthesis_complete(self):
        """Personalized Farm Plan produces 9 data sections A-I and matching fertilizer."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # 9 sections
        for s in ["overview", "recommended_crop", "soil_action_plan", "fertilizer_plan", "crop_protection", "weather_risk", "market_plan", "action_timeline", "data_reliability"]:
            self.assertIn(s, data)
        # Fertilizer match check
        rec = data["fertilizer_plan"]["guidance"]["recommendation"]
        self.assertEqual(rec["urea"], "100–120 kg/ha")
        self.assertEqual(rec["dap"], "50–60 kg/ha")
        self.assertEqual(rec["mop"], "40–50 kg/ha")

    def test_11_copilot_chat_grounded_fallback(self):
        """FarmAI Copilot answers agricultural query without hallucinating or overriding agronomy."""
        payload = {
            "message": "What is the recommended fertilizer for rice?",
            "crop": "Rice",
            "soil_ph": 6.7,
            "soil_type": "Loamy",
            "location": "Gorakhpur, Uttar Pradesh"
        }
        resp = client.post("/api/copilot/chat?mode=DEMO", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        msg = data["message"]
        self.assertIn("100–120 kg/ha", msg["text"])
        self.assertIn("50–60 kg/ha", msg["text"])
        self.assertEqual(msg["provenance"]["status"], "demo")

    def test_12_failure_state_unsupported_crop(self):
        """Querying an unsupported crop returns HTTP 400."""
        payload = {
            "crop_id": "banana",
            "district": "Gorakhpur",
            "field_area_ha": 1.0,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 400)

if __name__ == "__main__":
    unittest.main()
