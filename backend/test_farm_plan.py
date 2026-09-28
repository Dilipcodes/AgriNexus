"""
Comprehensive Backend Test Suite for Personalized Farm Plan (Screen 11)

Tests:
1. Basic Plan Formulation (Rice, Maize, Wheat in DEMO mode)
2. Exact 9 Data Sections (A through I) present and structured
3. Section J Copilot Action tested via /api/copilot/chat with farm_plan_context
4. Soil Health Card Calibration (+25% Urea for Low N matching Screen 8 exactly)
5. Missing Soil Parameters gracefully handled
6. Disease Detection Result integration (confidence directly from scan, no hardcoded '94%')
7. Empty Disease State (clean monitoring baseline + preliminary optical screening disclaimer)
8. Provenance Integrity (strict inheritance, no false 'live' upgrades)
9. Zero Net Profit / Guaranteed Profit guarantee (Strictly Target Yield × Mandi Modal Price)
10. Fertilizer doses match agronomy_engine.py verbatim without arbitrary split percentages
11. Unsupported crop validation
"""

import sys
import unittest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.agronomy_engine import build_fertilizer_guidance
from app.services.soil_service import load_regional_soil_intelligence
from app.models.schemas import SoilIntelligenceReport, SoilParameterValue, Provenance

client = TestClient(app)

class TestPersonalizedFarmPlan(unittest.TestCase):

    def test_01_nine_data_sections_present(self):
        """Verify that all 9 data sections (A through I) are present in response."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.5,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # 9 Data Sections A-I
        expected_sections = [
            "overview",           # A
            "recommended_crop",   # B
            "soil_action_plan",   # C
            "fertilizer_plan",    # D
            "crop_protection",    # E
            "weather_risk",       # F
            "market_plan",        # G
            "action_timeline",    # H
            "data_reliability"    # I
        ]
        for sec in expected_sections:
            self.assertIn(sec, data, f"Missing data section: {sec}")
            self.assertIsNotNone(data[sec], f"Section {sec} should not be None")

        # Plan ID and timestamp
        self.assertTrue(data["plan_id"].startswith("plan-rice-gorakhpur"))
        self.assertIn("generated_at", data)

    def test_02_crops_support_rice_maize_wheat(self):
        """Test plan generation across all three supported crops."""
        for cid in ["rice", "maize", "wheat"]:
            payload = {
                "crop_id": cid,
                "district": "Gorakhpur",
                "field_area_ha": 2.0,
                "mode": "DEMO"
            }
            resp = client.post("/api/farm-plan", json=payload)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["recommended_crop"]["id"], cid)
            self.assertEqual(len(data["action_timeline"]), 6, "Each crop must have 6 chronological stages")
            self.assertIn("2.0 Hectares", data["overview"]["field_area"])

    def test_03_zero_net_profit_and_gross_output_bounds(self):
        """Ensure NO Net Profit or Guaranteed Profit appears, and Gross Output is Target Yield × Modal Price."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        text_dump = resp.text.lower()

        # Strict checks: No Net Profit or Guaranteed Profit
        self.assertNotIn("net profit", text_dump)
        self.assertNotIn("net_profit", text_dump)
        self.assertNotIn("guaranteed profit", text_dump)
        self.assertNotIn("guaranteed_profit", text_dump)

        # Economic calculation check
        m = resp.json()["market_plan"]
        self.assertIsNotNone(m["gross_revenue_label"])
        self.assertIsNotNone(m["financial_disclaimer"])
        self.assertIn("Target Yield Range × Prevailing APMC Mandi Modal Price", m["financial_disclaimer"])
        if m["modal_price_numeric"] and m["target_yield_min"] and m["target_yield_max"]:
            expected_min = round(m["modal_price_numeric"] * m["target_yield_min"])
            expected_max = round(m["modal_price_numeric"] * m["target_yield_max"])
            self.assertEqual(m["gross_revenue_min"], expected_min)
            self.assertEqual(m["gross_revenue_max"], expected_max)

    def test_04_fertilizer_matches_agronomy_engine_exactly(self):
        """Ensure fertilizer doses match agronomy_engine.py verbatim without arbitrary second rule system."""
        soil_rep = load_regional_soil_intelligence("Gorakhpur")
        expected_guidance = build_fertilizer_guidance("rice", "Rice", soil_rep, "Gorakhpur")

        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.0,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        f_plan = resp.json()["fertilizer_plan"]["guidance"]

        self.assertEqual(f_plan["recommendation"]["urea"], expected_guidance.recommendation.urea)
        self.assertEqual(f_plan["recommendation"]["dap"], expected_guidance.recommendation.dap)
        self.assertEqual(f_plan["recommendation"]["mop"], expected_guidance.recommendation.mop)
        self.assertEqual(f_plan["provenance"]["source"], expected_guidance.provenance.source)

    def test_05_verified_soil_health_card_stcr_calibration(self):
        """Test that uploaded soil card with Low Nitrogen (+25% Urea) is properly calibrated."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "DEMO",
            "card_verified": True,
            "soil_ph": 6.8,
            "soil_n": 210.0, # Low N (<250) -> +25% Urea (125-150 kg/ha)
            "soil_p": 18.0,
            "soil_k": 180.0,
            "soil_zn": 0.45, # Low Zn (<0.60)
            "soil_s": 8.5    # Low S (<10.0)
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Soil Section check
        s_sec = data["soil_action_plan"]
        self.assertTrue(s_sec["is_verified"])
        # Check Zn and S deficiency actions added
        soil_actions_text = " ".join(s_sec["soil_improvement_actions"])
        self.assertIn("Zinc is Deficient", soil_actions_text)
        self.assertIn("Sulphur is Deficient", soil_actions_text)

        # Fertilizer Section STCR calibration check
        f_sec = data["fertilizer_plan"]
        self.assertTrue(f_sec["is_soil_test_calibrated"])
        self.assertIn("125–150 kg/ha", f_sec["guidance"]["recommendation"]["urea"])
        self.assertIn("ICAR-STCR", f_sec["calibration_basis"])

        # Reliability check: Verified items should include Soil Health Card readings
        rel = data["data_reliability"]
        verified_cat = next((c for c in rel["categories"] if c["category"] == "Verified"), None)
        self.assertIsNotNone(verified_cat)
        self.assertTrue(len(verified_cat["data_items"]) >= 2)

    def test_06_missing_soil_parameters_handled(self):
        """Missing parameters should not crash and should be logged in missing_parameters list."""
        payload = {
            "crop_id": "maize",
            "district": "Gorakhpur",
            "field_area_ha": 1.0,
            "mode": "DEMO",
            "card_verified": True,
            "soil_ph": 7.0
            # N, P, K, Zn, S omitted
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        s_sec = data["soil_action_plan"]
        self.assertTrue(len(s_sec["missing_parameters"]) > 0)

    def test_07_disease_detection_scan_confidence_dynamic(self):
        """Disease scan must reflect actual confidence from scan result, NEVER hardcoding '94%'."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "DEMO",
            "disease_result": {
                "disease_name": "Rice Blast",
                "scientific_name": "Magnaporthe oryzae",
                "confidence_display": "78.4% Match Probability", # Custom confidence
                "severity": "High",
                "severity_color": "rose",
                "immediate_actions": ["Apply Tricyclazole 75% WP as per KVK."],
                "prevention_tips": ["Avoid excessive nitrogen."],
                "provenance": {
                    "factor": "disease_detection",
                    "source": "AI Leaf Screening",
                    "timestamp_or_period": "Today",
                    "geographic_scope": "Field Leaf",
                    "status": "live",
                    "methodology_note": "Mobile camera inference"
                }
            }
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        prot = resp.json()["crop_protection"]

        self.assertTrue(prot["has_active_scan"])
        self.assertEqual(prot["disease_name"], "Rice Blast")
        self.assertEqual(prot["confidence_display"], "78.4% Match Probability")
        self.assertNotIn("94%", prot["confidence_display"])
        self.assertIn("AI-assisted preliminary optical screening", prot["screening_disclaimer"])

    def test_08_empty_disease_detection_baseline(self):
        """When disease scan is not provided, section E displays clean monitoring baseline."""
        payload = {
            "crop_id": "wheat",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "DEMO",
            "disease_result": None
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        prot = resp.json()["crop_protection"]

        self.assertFalse(prot["has_active_scan"])
        self.assertIn("No Active Disease Detected", prot["status_label"])
        self.assertIsNone(prot["disease_name"])
        self.assertIsNone(prot["confidence_display"])
        self.assertEqual(prot["severity"], "Clear")
        self.assertIn("AI-assisted preliminary optical screening", prot["screening_disclaimer"])

    def test_09_provenance_inheritance_no_false_upgrades(self):
        """REAL mode must not upgrade estimated benchmark models (like NDVI benchmark) to 'live'."""
        payload = {
            "crop_id": "rice",
            "district": "Gorakhpur",
            "field_area_ha": 1.2,
            "mode": "REAL"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()

        # Check Data Reliability breakdown
        rel = data["data_reliability"]
        estimated_cat = next((c for c in rel["categories"] if c["category"] == "Estimated"), None)
        self.assertIsNotNone(estimated_cat)
        # NDVI benchmark reference must remain estimated
        est_names = [item["name"] for item in estimated_cat["data_items"]]
        self.assertTrue(any("NDVI Benchmark" in n for n in est_names))

    def test_10_unsupported_crop_error(self):
        """Querying an unauthorized crop returns an appropriate error."""
        payload = {
            "crop_id": "avocado",
            "district": "Gorakhpur",
            "field_area_ha": 1.0,
            "mode": "DEMO"
        }
        resp = client.post("/api/farm-plan", json=payload)
        self.assertEqual(resp.status_code, 400)

    def test_11_section_j_copilot_chat_with_plan_context(self):
        """Verify Section J Copilot chat receives farm_plan_context and responds appropriately."""
        payload = {
            "message": "Can you summarize my farm plan?",
            "crop": "Rice",
            "soil_ph": 6.8,
            "soil_type": "Loamy",
            "location": "Gorakhpur, Uttar Pradesh",
            "farm_plan_context": {
                "field_area": "1.2 Hectares",
                "soil_status": "Field-Verified via Soil Health Card",
                "target_yield": "45–55 Qtl/ha",
                "fertilizer_dose": "Urea: 125–150 kg/ha, DAP: 50–60 kg/ha, MOP: 40–50 kg/ha",
                "pest_disease": "Clear",
                "gross_output": "₹98,235 – ₹1,20,065 / ha"
            }
        }
        resp = client.post("/api/copilot/chat?mode=DEMO", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("message", data)
        msg_text = data["message"]["text"]
        self.assertIn("Personalized Farm Plan Summary", msg_text)
        self.assertIn("1.2 Hectares", msg_text)
        self.assertIn("Urea: 125–150 kg/ha", msg_text)

if __name__ == "__main__":
    unittest.main()
