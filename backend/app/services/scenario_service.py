"""
AgriNexus / FarmAI - What-If Crop Scenario Simulator Service

Compares two candidate crops (e.g. Rice vs Maize, or Rice vs Wheat) across:
1. Biophysical and Soil suitability
2. Water and irrigation requirements (deterministic from ICAR water brackets)
3. Duration to harvest (documented ICAR maturity ranges)
4. Deterministic ICAR / STCR fertilizer packages (reusing agronomy_engine.py)
5. Prevailing APMC market prices and bounded gross output value ranges
6. Agronomic vulnerabilities and field risk management
7. Strict per-dimension provenance tracking (live / verified / estimated / demo)

Constraints:
- ZERO Net Profit calculation (avoids fabricating unverified operational costs)
- ZERO arbitrary chemical fertilizer pricing or subsidies
- ZERO arbitrary winner scores; transparent side-by-side trade-off analysis
"""

import os
import re
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

from app.models.schemas import (
    CropScenarioComparisonRequest,
    CropScenarioComparisonResponse,
    CropScenarioProfile,
    CropScenarioWaterMetric,
    CropScenarioDurationMetric,
    CropScenarioEconomics,
    CropScenarioTradeoff,
    FertilizerGuidance,
    SoilIntelligenceReport,
    Provenance
)
from app.services.agronomy_engine import (
    load_icar_crop_rules,
    load_fertilizer_package,
    build_fertilizer_guidance
)
from app.services.market_service import get_mandi_prices
from app.services.weather_service import fetch_weather_metrics
from app.services.soil_service import load_regional_soil_intelligence

logger = logging.getLogger("agrinexus.scenario")


def _find_mandi_item(table: list, crop_id: str) -> Optional[Any]:
    """
    Finds commodity in mandi table matching crop ID aliases.
    """
    cid = crop_id.lower()
    patterns = []
    if cid == "rice":
        patterns = ["paddy", "rice", "dhan"]
    elif cid == "wheat":
        patterns = ["wheat", "gehun", "dara"]
    elif cid == "maize":
        patterns = ["maize", "makka", "corn"]
    else:
        patterns = [cid]

    for item in table:
        c_name = item.crop.lower()
        if any(p in c_name for p in patterns):
            return item
    return None


def _parse_yield_range(yield_str: str) -> Tuple[Optional[float], Optional[float], str]:
    """
    Parses '45-55 Qtl/ha' or '50-60 Qtl/ha' into (45.0, 55.0, '45–55 Qtl/ha').
    """
    if not yield_str:
        return None, None, "Data unavailable"
    m = re.search(r"(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z/]+)?", yield_str)
    if m:
        try:
            low = float(m.group(1))
            high = float(m.group(2))
            unit = m.group(3) or "Qtl/ha"
            return low, high, f"{int(low) if low.is_integer() else low}–{int(high) if high.is_integer() else high} {unit}".strip()
        except Exception:
            pass
    return None, None, yield_str


async def simulate_crop_scenario(
    req: CropScenarioComparisonRequest,
    soil_report: Optional[SoilIntelligenceReport] = None
) -> CropScenarioComparisonResponse:
    """
    Executes a deterministic side-by-side scenario simulation for Crop A vs Crop B.
    """
    crop_rules_list = load_icar_crop_rules()
    crop_rules = {c["id"]: c for c in crop_rules_list}

    crop_a_id = req.crop_a.lower()
    crop_b_id = req.crop_b.lower()

    if crop_a_id not in crop_rules:
        raise ValueError(f"Crop '{req.crop_a}' is not a registered ICAR crop.")
    if crop_b_id not in crop_rules:
        raise ValueError(f"Crop '{req.crop_b}' is not a registered ICAR crop.")

    rule_a = crop_rules[crop_a_id]
    rule_b = crop_rules[crop_b_id]

    # Resolve active soil report
    is_real = (req.mode or "DEMO").upper() == "REAL"
    lat = req.lat if req.lat is not None else 26.7500
    lng = req.lng if req.lng is not None else 83.3700
    if soil_report is None:
        soil_report = load_regional_soil_intelligence(req.district, lat=lat, lng=lng, mode=req.mode)

    effective_ph = 6.7
    ph_param = soil_report.parameters.get("ph")
    if ph_param and ph_param.value is not None:
        effective_ph = ph_param.value
    effective_soil_type = soil_report.soil_type or "Loamy"

    # Resolve live/benchmark weather
    weather = await fetch_weather_metrics(lat, lng, mode=req.mode)
    current_temp = weather["temperature"]["numeric"]
    annual_rainfall = weather["rainfall"]["numeric"]

    # Retrieve mandi rates (live AGMARKNET in REAL mode, benchmark in DEMO mode)
    mandi_report = get_mandi_prices(lat=lat, lng=lng, district=req.district, mode=req.mode)

    # --- Build Profile for a single crop ---
    def build_crop_profile(crop_id: str, rule: Dict[str, Any]) -> CropScenarioProfile:
        crop_name = rule["name"]

        # Biophysical suitability tier
        temp_optimal = rule["temp_opt_min"] <= current_temp <= rule["temp_opt_max"]
        temp_tolerable = rule["temp_min"] <= current_temp <= rule["temp_max"]
        rain_tolerable = rule["rainfall_min"] <= annual_rainfall <= rule["rainfall_max"]
        ph_tolerable = rule["ph_min"] <= effective_ph <= rule["ph_max"]

        if temp_optimal and ph_tolerable and rain_tolerable:
            suitability = "High Suitability"
            badge_type = "high"
        elif temp_tolerable and ph_tolerable:
            suitability = "Moderate Suitability"
            badge_type = "moderate"
        else:
            suitability = "Moderate Suitability"
            badge_type = "moderate"

        # Water Metric
        rain_min = rule.get("rainfall_min", 600)
        rain_max = rule.get("rainfall_max", 1200)
        intensity = "High" if rain_min >= 700 else ("Moderate" if rain_min >= 400 else "Low")
        water_metric = CropScenarioWaterMetric(
            requirement_min_mm=rain_min,
            requirement_max_mm=rain_max,
            requirement_label=f"{rain_min:,}–{rain_max:,} mm",
            intensity=intensity,
            critical_stages=rule.get("growing_guide", {}).get("irrigationNeeds", "Regular seasonal irrigation."),
            drainage_sensitivity=rule.get("growing_guide", {}).get("soilRequirement", "Well-drained soil."),
            provenance=Provenance(
                factor="water_requirement",
                source=rule.get("source_citation", "ICAR Agronomic Package"),
                timestamp_or_period="Official Agronomy Edition",
                geographic_scope="Middle Gangetic Plain",
                status="live" if is_real else "demo",
                methodology_note="Standard crop water requirement / seasonal rainfall band from published ICAR package of practices."
            )
        )

        # Duration Metric
        dur_min = rule.get("duration_min_days", 100)
        dur_max = rule.get("duration_max_days", 120)
        dur_label = rule.get("duration_label", f"{dur_min}–{dur_max} Days")
        duration_metric = CropScenarioDurationMetric(
            min_days=dur_min,
            max_days=dur_max,
            label=dur_label,
            season=rule.get("ideal_season", "Kharif"),
            provenance=Provenance(
                factor="crop_duration",
                source=rule.get("source_citation", "ICAR Agronomic Package"),
                timestamp_or_period="Maturity Classification",
                geographic_scope="Regional Recommendation",
                status="live" if is_real else "demo",
                methodology_note="Field cycle from nursery/sowing to physiological maturity under recommended management."
            )
        )

        # Fertilizer Guidance (Reused from agronomy_engine)
        fert_guidance = build_fertilizer_guidance(
            crop_id=crop_id,
            crop_name=crop_name,
            soil_report=soil_report,
            region=req.district,
            mode=req.mode
        )

        # Target Yield & Economics
        fert_pkg = load_fertilizer_package(crop_id)
        yield_basis_str = fert_pkg.get("target_yield_basis", "") if fert_pkg else ""
        y_min, y_max, y_label = _parse_yield_range(yield_basis_str)

        # Mandi price lookup
        mandi_item = _find_mandi_item(mandi_report.table, crop_id)
        modal_numeric: Optional[float] = None
        modal_str = "Data unavailable"
        reported_date = None

        if mandi_item and mandi_item.modal_price and mandi_item.modal_price != "N/A":
            try:
                modal_numeric = float(str(mandi_item.modal_price).replace(",", "").strip())
                modal_str = f"₹{int(round(modal_numeric)):,} / Qtl"
                reported_date = mandi_item.reported_date or mandi_report.reported_date
            except (ValueError, TypeError):
                modal_numeric = None

        # Gross revenue calculation: strictly target yield × mandi modal price
        gross_min: Optional[float] = None
        gross_max: Optional[float] = None
        gross_label = "Data unavailable"

        if modal_numeric is not None and y_min is not None and y_max is not None:
            gross_min = round(y_min * modal_numeric)
            gross_max = round(y_max * modal_numeric)
            gross_label = f"₹{int(gross_min):,} – ₹{int(gross_max):,} / ha"

        price_prov = (
            mandi_report.provenance
            if mandi_item
            else Provenance(
                factor="mandi_rates",
                source=mandi_report.provenance.source,
                timestamp_or_period="Current Feed",
                geographic_scope=mandi_report.mandi_name,
                status=mandi_report.provenance.status,
                methodology_note="Arrival records for this specific commodity were not reported at this mandi today."
            )
        )

        economics = CropScenarioEconomics(
            target_yield_min=y_min,
            target_yield_max=y_max,
            target_yield_label=y_label,
            mandi_modal_price=modal_numeric,
            mandi_modal_price_str=modal_str,
            mandi_name=mandi_report.mandi_name,
            mandi_distance=mandi_report.distance,
            price_reported_date=reported_date,
            gross_revenue_min=gross_min,
            gross_revenue_max=gross_max,
            gross_revenue_label=gross_label,
            operational_cost_disclaimer=(
                "Gross output value is calculated strictly as ICAR Target Yield Range × Prevailing APMC Mandi Modal Price. "
                "Does NOT deduct variable farm operational expenses (seed, tractor tillage, manual labour, irrigation pumping, "
                "plant protection, and transportation). Net farm profit varies significantly with individual production costs."
            ),
            provenance=price_prov
        )

        # Agronomic risks sourced from ICAR crop rule
        agronomic_risks = rule.get("agronomic_risks", [
            rule.get("growing_guide", {}).get("irrigationNeeds", "Scout field regularly during critical vegetative phases.")
        ])

        crop_prov_status = "verified" if soil_report.provenance.status == "verified" else ("live" if is_real else "demo")
        crop_provenance = Provenance(
            factor="crop_scenario_profile",
            source=rule.get("source_citation", "ICAR Agronomic Package"),
            timestamp_or_period="Live Evaluation" if is_real else "September 2026 Evaluation",
            geographic_scope=f"{req.district} Profile (pH {effective_ph}, Temp {current_temp}°C)",
            status=crop_prov_status,
            methodology_note="Deterministic multi-dimensional evaluation combining ICAR agronomy rules with active field telemetry."
        )

        return CropScenarioProfile(
            id=crop_id,
            name=crop_name,
            icon=rule["icon"],
            suitability=suitability,
            badge_type=badge_type,
            reasons=rule.get("summary_reasons", []),
            duration=duration_metric,
            water=water_metric,
            fertilizer_guidance=fert_guidance,
            economics=economics,
            agronomic_risks=agronomic_risks,
            source_citation=rule.get("source_citation", "ICAR Package of Practices"),
            provenance=crop_provenance
        )

    profile_a = build_crop_profile(crop_a_id, rule_a)
    profile_b = build_crop_profile(crop_b_id, rule_b)

    # --- Compute Deterministic Trade-off Matrix ---
    # 1. Water trade-off
    mid_a = (profile_a.water.requirement_min_mm + profile_a.water.requirement_max_mm) / 2.0
    mid_b = (profile_b.water.requirement_min_mm + profile_b.water.requirement_max_mm) / 2.0

    if mid_a > mid_b:
        diff_w = round(mid_a - mid_b)
        pct_w = round(((mid_a - mid_b) / mid_a) * 100, 1)
        water_tradeoff = (
            f"{profile_b.name} requires significantly less water ({profile_b.water.requirement_label}) than "
            f"{profile_a.name} ({profile_a.water.requirement_label}), representing a deterministic water saving "
            f"of approximately {diff_w} mm (~{pct_w}% lower water requirement per hectare)."
        )
        water_saving_pct = pct_w
    elif mid_b > mid_a:
        diff_w = round(mid_b - mid_a)
        pct_w = round(((mid_b - mid_a) / mid_b) * 100, 1)
        water_tradeoff = (
            f"{profile_a.name} requires significantly less water ({profile_a.water.requirement_label}) than "
            f"{profile_b.name} ({profile_b.water.requirement_label}), representing a deterministic water saving "
            f"of approximately {diff_w} mm (~{pct_w}% lower water requirement per hectare)."
        )
        water_saving_pct = pct_w
    else:
        water_tradeoff = f"Both {profile_a.name} and {profile_b.name} share comparable seasonal water requirements ({profile_a.water.requirement_label})."
        water_saving_pct = 0.0

    # 2. Duration trade-off
    dur_mid_a = (profile_a.duration.min_days + profile_a.duration.max_days) / 2.0
    dur_mid_b = (profile_b.duration.min_days + profile_b.duration.max_days) / 2.0

    if dur_mid_a > dur_mid_b:
        diff_d = int(round(dur_mid_a - dur_mid_b))
        duration_tradeoff = (
            f"{profile_b.name} reaches maturity ~{diff_d} days earlier ({profile_b.duration.label}) than "
            f"{profile_a.name} ({profile_a.duration.label}), freeing the field earlier for timely succeeding crop sowing."
        )
        duration_diff_days = diff_d
    elif dur_mid_b > dur_mid_a:
        diff_d = int(round(dur_mid_b - dur_mid_a))
        duration_tradeoff = (
            f"{profile_a.name} reaches maturity ~{diff_d} days earlier ({profile_a.duration.label}) than "
            f"{profile_b.name} ({profile_b.duration.label}), freeing the field earlier for timely succeeding crop sowing."
        )
        duration_diff_days = diff_d
    else:
        duration_tradeoff = f"Both crops exhibit similar field cycle durations ({profile_a.duration.label})."
        duration_diff_days = 0

    # 3. Soil & drainage trade-off
    drainage_tradeoff = (
        f"{profile_a.name} ({rule_a.get('growing_guide', {}).get('soilRequirement', 'Alluvial')}) vs. "
        f"{profile_b.name} ({rule_b.get('growing_guide', {}).get('soilRequirement', 'Well-drained')}). "
        f"Confirm parcel slope and natural drainage before finalizing choice."
    )

    # 4. Economic trade-off summary
    econ_tradeoff = (
        f"{profile_a.name}: Target yield {profile_a.economics.target_yield_label} at {profile_a.economics.mandi_modal_price_str} "
        f"yielding gross output potential {profile_a.economics.gross_revenue_label}. "
        f"{profile_b.name}: Target yield {profile_b.economics.target_yield_label} at {profile_b.economics.mandi_modal_price_str} "
        f"yielding gross output potential {profile_b.economics.gross_revenue_label}."
    )

    # 5. Objective multi-dimensional key takeaways (NO WINNER SCORE)
    takeaways = [
        f"Duration: {duration_tradeoff}",
        f"Water Requirement: {water_tradeoff}",
        f"Soil Dynamics: {drainage_tradeoff}",
        f"Primary Field Vulnerabilities: {profile_a.name} ({profile_a.agronomic_risks[0] if profile_a.agronomic_risks else 'Standard'}) vs {profile_b.name} ({profile_b.agronomic_risks[0] if profile_b.agronomic_risks else 'Standard'}).",
        "Economic Realities: Gross output value does not deduct local variable production expenses. Choose the crop that fits your parcel's drainage, irrigation access, and crop rotation calendar."
    ]

    tradeoff = CropScenarioTradeoff(
        water_tradeoff=water_tradeoff,
        water_saving_pct=water_saving_pct,
        duration_tradeoff=duration_tradeoff,
        duration_diff_days=duration_diff_days,
        soil_drainage_tradeoff=drainage_tradeoff,
        economic_tradeoff=econ_tradeoff,
        key_takeaways=takeaways
    )

    provenance_summary = {
        "soil": soil_report.provenance,
        "weather": weather["temperature"]["provenance"],
        "market_a": profile_a.economics.provenance,
        "market_b": profile_b.economics.provenance,
        "fertilizer_a": profile_a.fertilizer_guidance.provenance if profile_a.fertilizer_guidance else soil_report.provenance,
        "fertilizer_b": profile_b.fertilizer_guidance.provenance if profile_b.fertilizer_guidance else soil_report.provenance,
        "yield_a": profile_a.duration.provenance,
        "yield_b": profile_b.duration.provenance
    }

    field_context = {
        "district": req.district,
        "temperature": f"{current_temp}°C",
        "rainfall": f"{annual_rainfall} mm",
        "soil_ph": effective_ph,
        "soil_type": effective_soil_type,
        "is_card_verified": soil_report.provenance.status == "verified"
    }

    return CropScenarioComparisonResponse(
        crop_a=profile_a,
        crop_b=profile_b,
        tradeoff=tradeoff,
        field_context=field_context,
        provenance_summary=provenance_summary
    )
