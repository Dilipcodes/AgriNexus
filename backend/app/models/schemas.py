"""
AgriNexus / FarmAI - Core Pydantic Schemas with Granular Provenance Metadata
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# Granular Provenance Metadata Model
class Provenance(BaseModel):
    factor: str = Field(..., description="The agronomic or data factor identifier")
    source: str = Field(..., description="Document, API or specification origin")
    timestamp_or_period: str = Field(..., description="Observation timestamp or time series range")
    geographic_scope: str = Field(..., description="Specific field coordinates, APMC catchment or agro-climatic zone")
    status: Literal["live", "verified", "estimated", "demo"] = Field(
        ..., 
        description="Strict status: live (external API), verified (official audited source), estimated (spatial/satellite model), demo (illustrative specification)"
    )
    methodology_note: str = Field(..., description="Clear explanation of how data was derived")


# Key Insight Metric Model
class KeyInsight(BaseModel):
    id: str
    label: str
    value: str
    numeric_value: float
    unit: str
    icon: str
    provenance: Provenance


# Secondary Parameter Model
class SecondaryMetric(BaseModel):
    label: str
    value: str
    provenance: Provenance


# Land Analysis Report Model
class LandAnalysisReport(BaseModel):
    report_date: str
    key_insights: List[KeyInsight]
    secondary_metrics: List[SecondaryMetric]


# 5-Year Cropping Distribution Model
class CropDistributionItem(BaseModel):
    name: str
    percentage: int
    color: str
    icon: str
    bg: str


class CroppingHistory(BaseModel):
    previous_season_crop: str
    currently_detected_crop: str
    common_rotation: str


class CroppingPatternReport(BaseModel):
    timeframe: str
    crops: List[CropDistributionItem]
    history: CroppingHistory
    note: str
    provenance: Provenance


# Mandi Market Record
class MandiItem(BaseModel):
    crop: str
    min_price: str
    max_price: str
    modal_price: str
    icon: str
    variety: Optional[str] = None
    grade: Optional[str] = None
    arrivals: Optional[str] = None
    reported_date: Optional[str] = None


class CandidateMandi(BaseModel):
    mandi_id: str
    mandi_name: str
    district: str
    state: str
    distance: str


class MandiMarketReport(BaseModel):
    mandi_name: str
    distance: str
    table: List[MandiItem]
    disclaimer: str
    provenance: Provenance
    reported_date: Optional[str] = None
    candidate_mandis: Optional[List[CandidateMandi]] = None


# Soil Parameter Model (Physical, Macronutrient, Micronutrient)
class SoilParameterValue(BaseModel):
    name: str
    symbol: str
    value: Optional[float] = None
    raw_text: Optional[str] = None
    unit: str
    rating: Optional[str] = None
    ideal_range: Optional[str] = None
    status: Literal["extracted", "missing", "flagged_for_review"] = "extracted"
    review_warning: Optional[str] = None


class SoilIntelligenceReport(BaseModel):
    source_type: Literal["regional_estimate", "uploaded_card"]
    region_name: str
    soil_type: str
    sample_id: Optional[str] = None
    farmer_name: Optional[str] = None
    test_date: Optional[str] = None
    lab_name: Optional[str] = None
    parameters: Dict[str, SoilParameterValue]
    warnings: List[str] = []
    provenance: Provenance


class SoilCardUploadRequest(BaseModel):
    file_data: str
    file_type: Optional[str] = "image/jpeg"
    mode: str = "DEMO"


class SoilCardUploadResponse(BaseModel):
    success: bool
    message: str
    report: SoilIntelligenceReport


# Agronomic Fertilizer Recommendation Model with ICAR source citations
class FertilizerDose(BaseModel):
    urea: str
    dap: str
    mop: str


class FertilizerGuidance(BaseModel):
    recommendation: Optional[FertilizerDose] = None
    assumptions: str
    disclaimer: str
    provenance: Provenance
    is_soil_test_calibrated: bool = False
    calibration_basis: Optional[str] = None
    soil_test_adjustments: Optional[List[str]] = None
    base_package_citation: Optional[str] = None


# Recommended Crop Model
class CropRecommendation(BaseModel):
    id: str
    rank: str
    name: str
    suitability: Literal["High Suitability", "Moderate Suitability"]
    badge_type: Literal["high", "moderate"]
    icon: str
    summary_reasons: List[str]
    detailed_reasons: List[str]
    ideal_season: str
    growing_guide: Optional[dict] = None
    fertilizer_guidance: Optional[FertilizerGuidance] = None
    provenance: Provenance


# AI Farm Copilot Chat Models
class ChatMessage(BaseModel):
    id: str
    sender: Literal["user", "bot"]
    text: str
    provenance: Optional[Provenance] = None


class CopilotChatRequest(BaseModel):
    message: str
    crop: Optional[str] = "Rice"
    soil_ph: Optional[float] = 6.7
    soil_type: Optional[str] = "Loamy"
    location: Optional[str] = "Gorakhpur, Uttar Pradesh"
    history: Optional[List[ChatMessage]] = []
    farm_plan_context: Optional[Dict[str, Any]] = None


class CopilotChatResponse(BaseModel):
    message: ChatMessage


# Crop Disease Detection Models
class DiseaseDetectionRequest(BaseModel):
    image_data: str = Field(..., description="Base64 data URL or raw image base64")
    crop: Optional[str] = Field("Rice", description="User-selected crop")
    mode: Optional[str] = Field("DEMO", description="Execution mode: DEMO or REAL")
    disease_key: Optional[str] = Field(None, description="Preset identifier if chosen from sample gallery")


class DiseaseDetectionResponse(BaseModel):
    is_plant: bool = Field(True, description="Whether the uploaded image appears to contain a plant/leaf", serialization_alias="isPlant")
    crop: str = Field(..., description="Evaluated crop name")
    disease_name: str = Field(..., description="Preliminary disease or condition assessment", serialization_alias="diseaseName")
    scientific_name: Optional[str] = Field("", description="Scientific binomial name", serialization_alias="scientificName")
    confidence_score: int = Field(..., description="Confidence score from 0-100", serialization_alias="confidenceScore")
    confidence_display: str = Field(..., description="Human-readable uncertainty/confidence", serialization_alias="confidenceDisplay")
    severity: str = Field(..., description="Assessed severity level")
    severity_color: Literal["green", "amber", "red"] = Field("amber", description="Severity color code", serialization_alias="severityColor")
    symptoms: List[str] = Field(default_factory=list, description="Observed visible symptoms")
    immediate_actions: List[str] = Field(default_factory=list, description="Recommended immediate actions", serialization_alias="immediateActions")
    prevention_tips: List[str] = Field(default_factory=list, description="Preventative and cultural measures", serialization_alias="preventionTips")
    advisory_disclaimer: str = Field(..., description="Agricultural expert advisory disclaimer", serialization_alias="advisoryDisclaimer")
    provenance: Provenance = Field(..., description="Data provenance metadata")
    analyzed_at: str = Field(..., description="Timestamp of diagnosis", serialization_alias="analyzedAt")

    class Config:
        populate_by_name = True


# --- What-If Crop Scenario Simulator Models ---

class CropScenarioComparisonRequest(BaseModel):
    crop_a: str = Field("rice", description="First crop ID, e.g. 'rice'")
    crop_b: str = Field("maize", description="Second crop ID, e.g. 'maize'")
    lat: Optional[float] = Field(None, description="Farmer field latitude")
    lng: Optional[float] = Field(None, description="Farmer field longitude")
    district: str = Field("Gorakhpur", description="District or Region name")
    mode: str = Field("DEMO", description="Execution mode: DEMO or REAL")
    card_verified: bool = Field(False, description="Whether soil values come from a verified Soil Health Card")
    soil_ph: Optional[float] = Field(None, description="Verified Soil pH")
    soil_n: Optional[float] = Field(None, description="Verified Soil Nitrogen (kg/ha)")
    soil_p: Optional[float] = Field(None, description="Verified Soil Phosphorus (kg/ha)")
    soil_k: Optional[float] = Field(None, description="Verified Soil Potassium (kg/ha)")
    soil_zn: Optional[float] = Field(None, description="Verified Soil Zinc (ppm)")
    soil_s: Optional[float] = Field(None, description="Verified Soil Sulphur (ppm)")


class CropScenarioWaterMetric(BaseModel):
    requirement_min_mm: int
    requirement_max_mm: int
    requirement_label: str
    intensity: Literal["High", "Moderate", "Low"]
    critical_stages: str
    drainage_sensitivity: str
    provenance: Provenance


class CropScenarioDurationMetric(BaseModel):
    min_days: int
    max_days: int
    label: str
    season: str
    provenance: Provenance


class CropScenarioEconomics(BaseModel):
    target_yield_min: Optional[float] = None
    target_yield_max: Optional[float] = None
    target_yield_label: str
    mandi_modal_price: Optional[float] = None
    mandi_modal_price_str: str
    mandi_name: str
    mandi_distance: Optional[str] = None
    price_reported_date: Optional[str] = None
    gross_revenue_min: Optional[float] = None
    gross_revenue_max: Optional[float] = None
    gross_revenue_label: str
    operational_cost_disclaimer: str
    provenance: Provenance


class CropScenarioProfile(BaseModel):
    id: str
    name: str
    icon: str
    suitability: Literal["High Suitability", "Moderate Suitability"]
    badge_type: Literal["high", "moderate"]
    reasons: List[str]
    duration: CropScenarioDurationMetric
    water: CropScenarioWaterMetric
    fertilizer_guidance: Optional[FertilizerGuidance] = None
    economics: CropScenarioEconomics
    agronomic_risks: List[str]
    source_citation: str
    provenance: Provenance


class CropScenarioTradeoff(BaseModel):
    water_tradeoff: str
    water_saving_pct: Optional[float] = None
    duration_tradeoff: str
    duration_diff_days: Optional[int] = None
    soil_drainage_tradeoff: str
    economic_tradeoff: str
    key_takeaways: List[str]


class CropScenarioComparisonResponse(BaseModel):
    crop_a: CropScenarioProfile
    crop_b: CropScenarioProfile
    tradeoff: CropScenarioTradeoff
    field_context: Dict[str, Any]
    provenance_summary: Dict[str, Provenance]


# --- Personalized Farm Plan Models (Sections A - I) ---

class FarmPlanDiseaseInput(BaseModel):
    crop: Optional[str] = None
    disease_name: str
    scientific_name: Optional[str] = None
    confidence: Optional[float] = None
    confidence_display: Optional[str] = None
    severity: Optional[str] = "Moderate"
    severity_color: Optional[str] = "amber"
    immediate_actions: List[str] = Field(default_factory=list)
    prevention_tips: List[str] = Field(default_factory=list)
    screening_disclaimer: Optional[str] = None
    provenance: Optional[Provenance] = None
    analyzed_at: Optional[str] = None

    class Config:
        populate_by_name = True


class FarmPlanRequest(BaseModel):
    crop_id: str = Field("rice", description="Crop identifier, e.g. 'rice', 'wheat', 'maize'")
    lat: Optional[float] = Field(None, description="Field latitude")
    lng: Optional[float] = Field(None, description="Field longitude")
    district: str = Field("Gorakhpur", description="District or Region name")
    field_area_ha: float = Field(1.2, description="Field area in hectares")
    mode: str = Field("DEMO", description="Execution mode: DEMO or REAL")
    card_verified: bool = Field(False, description="Whether soil test parameters are from a verified card")
    soil_ph: Optional[float] = Field(None, description="Soil pH")
    soil_n: Optional[float] = Field(None, description="Available Nitrogen (kg/ha)")
    soil_p: Optional[float] = Field(None, description="Available Phosphorus (kg/ha)")
    soil_k: Optional[float] = Field(None, description="Available Potassium (kg/ha)")
    soil_zn: Optional[float] = Field(None, description="Available Zinc (ppm)")
    soil_s: Optional[float] = Field(None, description="Available Sulphur (ppm)")
    disease_result: Optional[FarmPlanDiseaseInput] = Field(None, description="Optional active disease scan result")


# Section A: Farm Overview
class FarmPlanOverview(BaseModel):
    location_name: str
    field_area: str
    soil_status: str
    soil_status_tag: Literal["live", "verified", "estimated", "demo"]
    weather_status: str
    weather_status_tag: Literal["live", "verified", "estimated", "demo"]
    summary: str
    provenance: Provenance


# Section B: Recommended Crop
class FarmPlanCropSection(BaseModel):
    id: str
    name: str
    icon: str
    suitability: Literal["High Suitability", "Moderate Suitability"]
    badge_type: Literal["high", "moderate"]
    duration_label: str
    water_requirement_label: str
    water_intensity: str
    agronomic_risks: List[str]
    recommendation_reasons: List[str]
    provenance: Provenance


# Section C: Soil Action Plan
class SoilParameterItem(BaseModel):
    name: str
    symbol: str
    value: Optional[float] = None
    value_str: str
    unit: str
    rating: Optional[str] = None
    ideal_range: Optional[str] = None
    status: str


class FarmPlanSoilSection(BaseModel):
    ph_value: float
    ph_interpretation: str
    macronutrients: List[SoilParameterItem]
    micronutrients: List[SoilParameterItem]
    missing_parameters: List[str]
    soil_improvement_actions: List[str]
    is_verified: bool
    provenance: Provenance


# Section D: Fertilizer Plan
class FarmPlanFertilizerSection(BaseModel):
    crop_name: str
    guidance: FertilizerGuidance
    is_soil_test_calibrated: bool
    calibration_basis: str
    application_schedule_notes: List[str]
    provenance: Provenance


# Section E: Crop Protection
class FarmPlanCropProtectionSection(BaseModel):
    has_active_scan: bool
    status_label: str
    disease_name: Optional[str] = None
    scientific_name: Optional[str] = None
    confidence_display: Optional[str] = None
    severity: Optional[str] = None
    severity_color: Optional[str] = None
    immediate_actions: List[str] = []
    prevention_tips: List[str] = []
    screening_disclaimer: str
    provenance: Optional[Provenance] = None


# Section F: Weather & Risk
class FarmPlanWeatherSection(BaseModel):
    temperature_value: str
    temperature_numeric: float
    humidity_value: str
    rainfall_annual_benchmark: str
    precautions: List[str]
    provenance: Provenance


# Section G: Market Plan
class FarmPlanMarketSection(BaseModel):
    commodity: str
    modal_price_str: str
    modal_price_numeric: Optional[float] = None
    min_price_str: Optional[str] = None
    max_price_str: Optional[str] = None
    mandi_name: str
    mandi_distance: Optional[str] = None
    reported_date: Optional[str] = None
    target_yield_label: str
    target_yield_min: Optional[float] = None
    target_yield_max: Optional[float] = None
    gross_revenue_label: str
    gross_revenue_min: Optional[float] = None
    gross_revenue_max: Optional[float] = None
    financial_disclaimer: str
    provenance: Provenance


# Section H: Action Timeline
class FarmPlanTimelineItem(BaseModel):
    stage_id: str
    stage_name: str
    timeframe: str
    agronomic_actions: List[str]
    water_management: str
    nutrient_guidance: str
    field_protection: str


# Section I: Data Reliability & Provenance
class FarmPlanDataReliabilityCategory(BaseModel):
    category: Literal["Verified", "Live", "Estimated", "Demo"]
    badge_color: str
    description: str
    data_items: List[Dict[str, str]]


class FarmPlanDataReliability(BaseModel):
    verified: List[str]
    live: List[str]
    estimated: List[str]
    demo: List[str]
    categories: List[FarmPlanDataReliabilityCategory]


# Top-Level Farm Plan Response (Containing all 9 Sections A - I)
class FarmPlanResponse(BaseModel):
    plan_id: str
    generated_at: str
    overview: FarmPlanOverview                  # Section A
    recommended_crop: FarmPlanCropSection       # Section B
    soil_action_plan: FarmPlanSoilSection       # Section C
    fertilizer_plan: FarmPlanFertilizerSection   # Section D
    crop_protection: FarmPlanCropProtectionSection # Section E
    weather_risk: FarmPlanWeatherSection        # Section F
    market_plan: FarmPlanMarketSection          # Section G
    action_timeline: List[FarmPlanTimelineItem] # Section H
    data_reliability: FarmPlanDataReliability   # Section I


