import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ArrowLeft, RefreshCw, FileText, CheckCircle2,
  Calendar, Droplets, Thermometer, ShieldCheck, AlertTriangle,
  TrendingUp, Clock, Sprout, Sparkles, MessageSquare, Info,
  Layers, MapPin, Beaker, HelpCircle, ExternalLink
} from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { fetchFarmPlan } from '../services/api';

const AVAILABLE_CROPS = [
  { id: 'rice', name: 'Rice', icon: '🌾' },
  { id: 'maize', name: 'Maize', icon: '🌽' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' }
];

export default function Screen11FarmPlan({
  onNavigate,
  farmData,
  soilIntelligence,
  landAnalysis,
  diseaseResult,
  selectedCropId = 'rice',
  appMode = 'DEMO'
}) {
  const [activeCropId, setActiveCropId] = useState(selectedCropId || 'rice');
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPlan() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchFarmPlan({
          cropId: activeCropId,
          lat: farmData?.coordinates?.lat ?? 26.7500,
          lng: farmData?.coordinates?.lng ?? 83.3700,
          district: farmData?.district ?? 'Gorakhpur',
          fieldAreaHa: farmData?.area?.hectares ?? farmData?.totalArea ?? 0.97,
          mode: appMode,
          soilReport: soilIntelligence,
          diseaseResult: diseaseResult
        });

        if (isMounted) {
          if (res) {
            setPlan(res);
          } else {
            setErrorMsg('Unable to formulate farm plan at this time.');
          }
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load personalized farm plan.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, [activeCropId, farmData, farmData?.area?.hectares, soilIntelligence, diseaseResult, appMode]);

  const handleAskCopilot = () => {
    if (!plan) {
      onNavigate(9);
      return;
    }

    const planContext = {
      crop: plan.recommended_crop?.name || 'Rice',
      field_area: plan.overview?.field_area || '1.2 ha',
      soil_status: plan.overview?.soil_status || 'Regional Baseline',
      target_yield: plan.market_plan?.target_yield_label || 'ICAR Baseline',
      fertilizer_dose: plan.fertilizer_plan?.guidance?.recommendation
        ? `Urea: ${plan.fertilizer_plan.guidance.recommendation.urea}, DAP: ${plan.fertilizer_plan.guidance.recommendation.dap}, MOP: ${plan.fertilizer_plan.guidance.recommendation.mop}`
        : 'Consult KVK',
      pest_disease: plan.crop_protection?.has_active_scan
        ? plan.crop_protection.disease_name
        : 'Clear',
      gross_output: plan.market_plan?.gross_revenue_label || 'Bounded by APMC modal rates'
    };

    onNavigate(9, { farmPlanContext: planContext });
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onNavigate(7)}
            className="flex items-center text-xs font-semibold text-emerald-100 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} className="mr-0.5" /> Back to Recommendations
          </button>
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm uppercase">
            Screen 11 • Plan
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileText size={22} className="text-emerald-300" />
              Personalized Farm Plan
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-sm">
              Comprehensive ICAR-calibrated operational roadmap synthesized from your parcel telemetry, soil intelligence, and APMC market arrivals.
            </p>
          </div>
          {plan && (
            <div className="text-right text-[10px] text-emerald-200">
              <div className="font-mono bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                {plan.plan_id.split('-').slice(0, 3).join('-')}
              </div>
              <div className="mt-0.5">{plan.generated_at}</div>
            </div>
          )}
        </div>

        {/* Crop Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-emerald-600/50 flex gap-2 overflow-x-auto pb-1">
          {AVAILABLE_CROPS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCropId(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                activeCropId === c.id
                  ? 'bg-white text-emerald-800 font-bold shadow'
                  : 'bg-emerald-900/60 text-emerald-100 hover:bg-emerald-900/90'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-5">
        {isLoading && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
            <RefreshCw size={32} className="animate-spin text-emerald-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Formulating Personalized Farm Plan...</div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Synthesizing soil parameters, biophysical ICAR rules, and live mandi price arrivals.
            </p>
          </div>
        )}

        {errorMsg && !isLoading && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error: </span>
              {errorMsg}
            </div>
          </div>
        )}

        {plan && !isLoading && (
          <>
            {/* SECTION A: Farm Overview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    A
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Farm Overview & Boundaries</h2>
                </div>
                <ProvenanceBadge provenance={plan.overview.provenance} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> Location
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{plan.overview.location_name}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Layers size={12} className="text-slate-500" /> Parcel Area
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{plan.overview.field_area}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Beaker size={12} className="text-slate-500" /> Soil Profile
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        plan.overview.soil_status_tag === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {plan.overview.soil_status}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Thermometer size={12} className="text-slate-500" /> Climate Feed
                  </div>
                  <div className="text-[11px] font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        plan.overview.weather_status_tag === 'live' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                    />
                    {plan.overview.weather_status}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60 leading-relaxed">
                {plan.overview.summary}
              </p>
            </div>

            {/* SECTION B: Recommended Crop */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    B
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Recommended Crop</h2>
                </div>
                <ProvenanceBadge provenance={plan.recommended_crop.provenance} />
              </div>

              <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{plan.recommended_crop.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">{plan.recommended_crop.name}</h3>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      Duration: {plan.recommended_crop.duration_label}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    plan.recommended_crop.badge_type === 'high'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {plan.recommended_crop.suitability}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Droplets size={12} className="text-blue-500" /> Water Requirement
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    {plan.recommended_crop.water_requirement_label}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Intensity: {plan.recommended_crop.water_intensity}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Calendar size={12} className="text-emerald-600" /> Duration
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">
                    {plan.recommended_crop.duration_label}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">From sowing to harvest</span>
                </div>
              </div>

              {/* Recommendation Reasons */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Agronomic Suitability Rationale
                </div>
                <div className="space-y-1">
                  {plan.recommended_crop.recommendation_reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agronomic Risks */}
              {plan.recommended_crop.agronomic_risks?.length > 0 && (
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 space-y-1">
                  <div className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-600" /> Key Agronomic Considerations
                  </div>
                  <ul className="text-xs text-amber-900 list-disc list-inside space-y-0.5">
                    {plan.recommended_crop.agronomic_risks.map((risk, idx) => (
                      <li key={idx} className="leading-tight">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* SECTION C: Soil Action Plan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    C
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Soil Action Plan</h2>
                </div>
                <ProvenanceBadge provenance={plan.soil_action_plan.provenance} />
              </div>

              {/* pH Card */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Soil Reaction (pH)</div>
                  <div className="text-sm font-black text-slate-800">{plan.soil_action_plan.ph_value.toFixed(1)}</div>
                </div>
                <div className="text-right max-w-[200px]">
                  <span className="text-[11px] text-slate-600 font-medium">
                    {plan.soil_action_plan.ph_interpretation}
                  </span>
                </div>
              </div>

              {/* Macronutrients Grid */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Macronutrients Status
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {plan.soil_action_plan.macronutrients.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                      <div className="text-[10px] text-slate-400 font-bold">{m.symbol}</div>
                      <div className="text-xs font-black text-slate-800 mt-0.5">
                        {m.value !== null ? `${m.value} ${m.unit}` : 'Not Tested'}
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                          m.rating === 'Low'
                            ? 'bg-rose-100 text-rose-700'
                            : m.rating === 'High'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {m.rating || 'Estimated'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micronutrients Chips */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Secondary & Micronutrients
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {plan.soil_action_plan.micronutrients.map((micro, idx) => (
                    <div key={idx} className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[10px]">
                      <div className="font-bold text-slate-500">{micro.symbol}</div>
                      <div className="font-semibold text-slate-800">
                        {micro.value !== null ? `${micro.value}` : 'N/A'}
                      </div>
                      <div className="text-[8px] text-slate-400">{micro.rating || micro.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil Improvement Actions */}
              {plan.soil_action_plan.soil_improvement_actions?.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    Actionable Soil Amendments
                  </div>
                  <div className="space-y-1">
                    {plan.soil_action_plan.soil_improvement_actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-snug flex items-start gap-1.5"
                      >
                        <Sprout size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION D: Fertilizer Plan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    D
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Fertilizer Plan</h2>
                </div>
                <ProvenanceBadge provenance={plan.fertilizer_plan.provenance} />
              </div>

              {/* Calibration Banner */}
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck
                    size={16}
                    className={plan.fertilizer_plan.is_soil_test_calibrated ? 'text-emerald-600' : 'text-amber-500'}
                  />
                  <span className="font-semibold">{plan.fertilizer_plan.calibration_basis}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    plan.fertilizer_plan.is_soil_test_calibrated
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {plan.fertilizer_plan.is_soil_test_calibrated ? 'STCR Calibrated' : 'Regional Baseline'}
                </span>
              </div>

              {/* Doses Card */}
              {plan.fertilizer_plan.guidance?.recommendation && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Urea (46% N)</div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      {plan.fertilizer_plan.guidance.recommendation.urea}
                    </div>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">DAP (18-46-0)</div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      {plan.fertilizer_plan.guidance.recommendation.dap}
                    </div>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">MOP (60% K)</div>
                    <div className="text-sm font-black text-emerald-950 mt-1">
                      {plan.fertilizer_plan.guidance.recommendation.mop}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Notes */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Application Schedule & Guidelines
                </div>
                <div className="space-y-1">
                  {plan.fertilizer_plan.application_schedule_notes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION E: Crop Protection */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    E
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Crop Protection</h2>
                </div>
                <ProvenanceBadge provenance={plan.crop_protection.provenance} />
              </div>

              {plan.crop_protection.has_active_scan ? (
                /* Active Diagnostic Scan Result */
                <div className="space-y-3">
                  <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle size={15} className="text-rose-600" />
                        {plan.crop_protection.disease_name}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                        {plan.crop_protection.severity} Severity
                      </span>
                    </div>
                    {plan.crop_protection.scientific_name && (
                      <div className="text-xs text-rose-800 italic">
                        {plan.crop_protection.scientific_name}
                      </div>
                    )}
                    {plan.crop_protection.confidence_display && (
                      <div className="text-[11px] font-semibold text-rose-700">
                        AI Match: {plan.crop_protection.confidence_display}
                      </div>
                    )}
                  </div>

                  {plan.crop_protection.immediate_actions?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                        Immediate Interventions
                      </div>
                      <div className="space-y-1">
                        {plan.crop_protection.immediate_actions.map((act, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 p-2 rounded-xl text-xs text-slate-800 flex items-start gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Clean Baseline State */
                <div className="space-y-3">
                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-emerald-950">
                          {plan.crop_protection.status_label}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          Routine preventive field monitoring baseline active
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      Clear
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Preventive Scouting Protocols
                    </div>
                    <div className="space-y-1">
                      {plan.crop_protection.prevention_tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-2 rounded-xl text-xs text-slate-700 flex items-start gap-1.5"
                        >
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Optical Screening Disclaimer */}
              <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/60 flex items-start gap-1.5">
                <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{plan.crop_protection.screening_disclaimer}</span>
              </div>
            </div>

            {/* SECTION F: Weather & Risk */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    F
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Weather & Seasonal Risk</h2>
                </div>
                <ProvenanceBadge provenance={plan.weather_risk.provenance} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Thermometer size={12} className="text-rose-500" /> Temp
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">{plan.weather_risk.temperature_value}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Droplets size={12} className="text-blue-500" /> Moisture
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">{plan.weather_risk.humidity_value}</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Calendar size={12} className="text-emerald-500" /> Normal Rain
                  </div>
                  <div className="text-xs font-black text-slate-800 mt-0.5">
                    {plan.weather_risk.rainfall_annual_benchmark}
                  </div>
                </div>
              </div>

              {/* Weather Precautions */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                  Seasonal Irrigation & Field Safeguards
                </div>
                <div className="space-y-1">
                  {plan.weather_risk.precautions.map((prec, idx) => (
                    <div key={idx} className="bg-blue-50/60 p-2 rounded-xl text-xs text-blue-950 flex items-start gap-1.5 border border-blue-100">
                      <Droplets size={13} className="text-blue-600 shrink-0 mt-0.5" />
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION G: Market Plan */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    G
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Market Plan & Output Value</h2>
                </div>
                <ProvenanceBadge provenance={plan.market_plan.provenance} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Prevailing Modal Price</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">{plan.market_plan.modal_price_str}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {plan.market_plan.mandi_name} ({plan.market_plan.mandi_distance})
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">ICAR Target Yield</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">{plan.market_plan.target_yield_label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Medium soil fertility basis</div>
                </div>
              </div>

              {/* Bounded Gross Output Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-3.5 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp size={13} className="text-emerald-600" /> Bounded Gross Output Value
                </div>
                <div className="text-base font-black text-emerald-950 mt-1">
                  {plan.market_plan.gross_revenue_label}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                  Calculation: Target Yield Range × Mandi Modal Price
                </div>
              </div>

              {/* Financial Disclaimer */}
              <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                <span className="font-bold text-slate-600">Economic Notice: </span>
                {plan.market_plan.financial_disclaimer}
              </div>
            </div>

            {/* SECTION H: Action Timeline */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    H
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Crop-Cycle Action Timeline</h2>
                    <span className="text-[10px] text-slate-500">6 Chronological Field Stages</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ICAR Chronology
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {plan.action_timeline.map((stage, idx) => (
                  <div key={stage.stage_id} className="relative pl-8 space-y-1.5">
                    {/* Circle marker */}
                    <div className="absolute left-1.5 top-1 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800">
                        Stage {idx + 1}: {stage.stage_name}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {stage.timeframe}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      {/* Agronomic actions */}
                      <div className="space-y-0.5">
                        {stage.agronomic_actions.map((act, actIdx) => (
                          <div key={actIdx} className="text-slate-700 flex items-start gap-1">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>

                      {/* Water & Nutrients */}
                      <div className="grid grid-cols-1 gap-1 pt-1 border-t border-slate-200/50 text-[11px]">
                        {stage.water_management && (
                          <div className="text-blue-900 flex items-start gap-1">
                            <Droplets size={12} className="text-blue-500 shrink-0 mt-0.5" />
                            <span><strong className="font-semibold">Water:</strong> {stage.water_management}</span>
                          </div>
                        )}
                        {stage.nutrient_guidance && (
                          <div className="text-emerald-900 flex items-start gap-1">
                            <Sprout size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span><strong className="font-semibold">Nutrients:</strong> {stage.nutrient_guidance}</span>
                          </div>
                        )}
                        {stage.field_protection && (
                          <div className="text-amber-900 flex items-start gap-1">
                            <ShieldCheck size={12} className="text-amber-600 shrink-0 mt-0.5" />
                            <span><strong className="font-semibold">Protection:</strong> {stage.field_protection}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION I: Data Reliability & Provenance */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    I
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">Data Reliability & Provenance</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Audit Framework
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                AgriNexus preserves granular provenance across all components. REAL mode integrates live telemetry and official market feeds without upgrading estimated baseline models.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {plan.data_reliability.categories.map((cat, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          cat.category === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cat.category === 'Live'
                            ? 'bg-blue-100 text-blue-800'
                            : cat.category === 'Estimated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {cat.data_items.length} item{cat.data_items.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-medium leading-tight">
                      {cat.description}
                    </div>

                    <ul className="text-[10px] text-slate-700 space-y-0.5 pt-0.5">
                      {cat.data_items.map((item, itemIdx) => (
                        <li key={itemIdx} className="truncate">
                          • {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION J: Action / Ask FarmAI Copilot */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Have questions about this plan?</h3>
                  <p className="text-xs text-emerald-200 mt-0.5 leading-snug">
                    FarmAI Copilot can explain application schedules, compare alternative rotation strategies, and clarify agronomic timing.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAskCopilot}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageSquare size={16} />
                <span>Ask FarmAI About This Plan (Screen 9)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
