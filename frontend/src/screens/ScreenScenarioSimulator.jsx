import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ArrowLeftRight, Droplets, Calendar, Beaker,
  TrendingUp, AlertTriangle, ShieldCheck, Info, CheckCircle2,
  Sparkles, HelpCircle, ChevronDown, RefreshCw
} from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { compareCropScenarios } from '../services/api';

const AVAILABLE_CROPS = [
  { id: 'rice', name: 'Rice', icon: '🌾' },
  { id: 'maize', name: 'Maize', icon: '🌽' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' }
];

export default function ScreenScenarioSimulator({
  onNavigate,
  farmData,
  soilIntelligence,
  landAnalysis,
  appMode = 'DEMO',
  initialCropA = 'rice',
  initialCropB = 'maize'
}) {
  const [cropA, setCropA] = useState(initialCropA);
  const [cropB, setCropB] = useState(initialCropB);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function runSimulation() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await compareCropScenarios({
          cropA,
          cropB,
          lat: farmData?.coordinates?.lat ?? 26.7500,
          lng: farmData?.coordinates?.lng ?? 83.3700,
          district: farmData?.district ?? 'Gorakhpur',
          mode: appMode,
          soilReport: soilIntelligence
        });
        if (isMounted) {
          if (res) {
            setComparison(res);
          } else {
            setErrorMsg('Unable to compute comparison at this time.');
          }
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to fetch scenario comparison.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    runSimulation();
    return () => {
      isMounted = false;
    };
  }, [cropA, cropB, appMode, farmData, soilIntelligence]);

  const handleSwap = () => {
    const temp = cropA;
    setCropA(cropB);
    setCropB(temp);
  };

  const profA = comparison?.crop_a;
  const profB = comparison?.crop_b;
  const tradeoff = comparison?.tradeoff;
  const isCardVerified = comparison?.field_context?.is_card_verified;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(7)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Back to Recommendations"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-sm text-slate-900 tracking-tight">
            What-If Scenario Simulator
          </h2>
          <span className="text-[10px] text-slate-500 font-medium">
            Objective Farm Intelligence Matrix
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            appMode === 'REAL'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {appMode}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Crop Selection Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            {/* Crop A Selector */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider text-left">
                Primary Crop (A)
              </label>
              <select
                value={cropA}
                onChange={(e) => setCropA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {AVAILABLE_CROPS.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === cropB}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="pt-3">
              <button
                onClick={handleSwap}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="Swap Crops"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Crop B Selector */}
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider text-left">
                Alternative (B)
              </label>
              <select
                value={cropB}
                onChange={(e) => setCropB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {AVAILABLE_CROPS.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === cropA}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <span className="text-[10px] text-slate-400 font-semibold shrink-0">Presets:</span>
            <button
              onClick={() => { setCropA('rice'); setCropB('maize'); }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer ${
                cropA === 'rice' && cropB === 'maize'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Rice vs. Maize
            </button>
            <button
              onClick={() => { setCropA('rice'); setCropB('wheat'); }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer ${
                cropA === 'rice' && cropB === 'wheat'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Rice vs. Wheat
            </button>
            <button
              onClick={() => { setCropA('maize'); setCropB('wheat'); }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all shrink-0 cursor-pointer ${
                cropA === 'maize' && cropB === 'wheat'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Maize vs. Wheat
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">
              Evaluating multi-dimensional agronomic scenario...
            </span>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 text-left">
            {errorMsg}
          </div>
        )}

        {/* Comparison Content */}
        {!isLoading && profA && profB && (
          <div className="space-y-4">
            {/* Side-by-Side Crop Headers */}
            <div className="grid grid-cols-2 gap-3">
              {/* Crop A Card */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                    {profA.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{profA.name}</h3>
                    <span className="text-[10px] text-slate-500 font-medium">{profA.duration.season}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    profA.badge_type === 'high'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {profA.suitability}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {profA.duration.label}
                  </span>
                </div>
              </div>

              {/* Crop B Card */}
              <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs text-left space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
                    {profB.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{profB.name}</h3>
                    <span className="text-[10px] text-slate-500 font-medium">{profB.duration.season}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    profB.badge_type === 'high'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {profB.suitability}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {profB.duration.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Water & Irrigation Requirement */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <h4 className="text-xs font-bold text-slate-900">Water & Irrigation Demand</h4>
                </div>
                <ProvenanceBadge provenance={profA.water.provenance} />
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profA.name}</span>
                  <span className="text-xs font-black text-slate-900 block font-mono">{profA.water.requirement_label}</span>
                  <p className="text-[10px] text-slate-600 leading-snug">{profA.water.critical_stages}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profB.name}</span>
                  <span className="text-xs font-black text-slate-900 block font-mono">{profB.water.requirement_label}</span>
                  <p className="text-[10px] text-slate-600 leading-snug">{profB.water.critical_stages}</p>
                </div>
              </div>

              {/* Water saving callout banner */}
              {tradeoff?.water_saving_pct > 0 && (
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-medium leading-relaxed">
                  💧 <strong>Water Saving Note:</strong> {tradeoff.water_tradeoff}
                </div>
              )}
            </div>

            {/* 2. ICAR Fertilizer Guidance (Physical Quantities Only) */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Beaker className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">ICAR Fertilizer Requirements</h4>
                </div>
                <ProvenanceBadge provenance={profA.fertilizer_guidance?.provenance} />
              </div>

              {/* Calibration Status */}
              {isCardVerified ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Field-Calibrated to Verified Soil Health Card test values</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Medium-Fertility Benchmark (Upload card on Land Analysis to calibrate)</span>
                </div>
              )}

              {/* Dose Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Crop A Doses */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profA.name} Dosage</span>
                  {profA.fertilizer_guidance?.recommendation ? (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-500">Urea:</span> <strong className="font-mono">{profA.fertilizer_guidance.recommendation.urea}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-500">DAP:</span> <strong className="font-mono">{profA.fertilizer_guidance.recommendation.dap}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-500">MOP:</span> <strong className="font-mono">{profA.fertilizer_guidance.recommendation.mop}</strong></div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Package not registered</span>
                  )}
                </div>

                {/* Crop B Doses */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profB.name} Dosage</span>
                  {profB.fertilizer_guidance?.recommendation ? (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-500">Urea:</span> <strong className="font-mono">{profB.fertilizer_guidance.recommendation.urea}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-500">DAP:</span> <strong className="font-mono">{profB.fertilizer_guidance.recommendation.dap}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-500">MOP:</span> <strong className="font-mono">{profB.fertilizer_guidance.recommendation.mop}</strong></div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">Package not registered</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Market & Bounded Economics (NO NET PROFIT) */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">Mandi Price & Gross Output Potential</h4>
                </div>
                <ProvenanceBadge provenance={profA.economics.provenance} />
              </div>

              {/* Nearest Mandi Info */}
              <div className="text-[10px] text-slate-500 flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span><strong>Market:</strong> {profA.economics.mandi_name}</span>
                <span><strong>Distance:</strong> {profA.economics.mandi_distance || 'Nearby APMC'}</span>
              </div>

              {/* Economic Comparison Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Crop A Economics */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profA.name}</span>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Yield</span>
                    <strong className="text-xs text-slate-900 font-mono">{profA.economics.target_yield_label}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Modal Price</span>
                    <strong className="text-xs text-emerald-800 font-mono">{profA.economics.mandi_modal_price_str}</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 block">Gross Output Value:</span>
                    <strong className="text-xs text-emerald-950 font-mono block leading-tight">{profA.economics.gross_revenue_label}</strong>
                  </div>
                </div>

                {/* Crop B Economics */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">{profB.name}</span>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Yield</span>
                    <strong className="text-xs text-slate-900 font-mono">{profB.economics.target_yield_label}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Modal Price</span>
                    <strong className="text-xs text-emerald-800 font-mono">{profB.economics.mandi_modal_price_str}</strong>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-600 block">Gross Output Value:</span>
                    <strong className="text-xs text-emerald-950 font-mono block leading-tight">{profB.economics.gross_revenue_label}</strong>
                  </div>
                </div>
              </div>

              {/* Strict Operational Cost Disclaimer */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 leading-snug space-y-1">
                <div className="flex items-center gap-1 font-bold text-amber-950">
                  <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                  <span>Important Financial Transparency Notice:</span>
                </div>
                <p>{profA.economics.operational_cost_disclaimer}</p>
              </div>
            </div>

            {/* 4. Agronomic Vulnerabilities & Field Management */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left space-y-2.5">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900">Agronomic Risks & Field Vulnerabilities</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Crop A Risks */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block uppercase">{profA.name} Risks:</span>
                  <ul className="space-y-1 text-[10px] text-slate-600 leading-snug">
                    {profA.agronomic_risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Crop B Risks */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 block uppercase">{profB.name} Risks:</span>
                  <ul className="space-y-1 text-[10px] text-slate-600 leading-snug">
                    {profB.agronomic_risks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Objective Trade-Off Takeaways (NO WINNER SCORE) */}
            <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200 shadow-xs text-left space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-950">Multi-Dimensional Decision Summary</h4>
              </div>
              <p className="text-[10px] text-emerald-800">
                AgriNexus presents objective trade-offs rather than an arbitrary "winner score", because crop choice depends on your field's drainage and operational calendar.
              </p>
              <div className="space-y-1.5 pt-1">
                {tradeoff?.key_takeaways?.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Provenance & Citations Accordion */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs text-left space-y-1.5 text-[10px] text-slate-500">
              <span className="font-bold text-slate-700 block">Official Scientific & Market Citations:</span>
              <p>• <strong>Agronomy & Fertilizer:</strong> {profA.source_citation} & {profB.source_citation}</p>
              <p>• <strong>Mandi Pricing:</strong> {profA.economics.provenance.source} ({profA.economics.provenance.status.toUpperCase()} Feed)</p>
              <p>• <strong>Soil Basis:</strong> {comparison?.provenance_summary?.soil?.source}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => onNavigate(11, { cropId: cropA })}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Formulate Farm Plan for {profA?.name || 'Selected Crop'} (Screen 11)</span>
          </button>

          <button
            onClick={() => onNavigate(9)}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Ask Farm Copilot about this comparison</span>
          </button>
        </div>
      </div>
    </div>
  );
}
