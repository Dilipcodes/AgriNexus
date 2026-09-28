import React, { useState } from 'react';
import { 
  ChevronLeft, CheckCircle2, Calendar, BookOpen, TrendingUp, Sparkles, 
  ArrowRight, Info, AlertCircle, ShieldCheck, Beaker
} from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function Screen8CropDetails({ onNavigate, selectedCrop, soilIntelligence, appMode }) {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Growing Guide' | 'Market' | 'More'

  const crop = selectedCrop || {
    name: "Rice",
    suitability: "High Suitability",
    icon: "🌾",
    detailedReasons: [
      "Suitable temperature (25°C – 32°C)",
      "Adequate rainfall (800 – 1200 mm)",
      "Good soil pH (6.0 – 7.5)",
      "Suitable moisture conditions",
      "Commonly grown in your area",
      "Good market price"
    ],
    idealSeason: "Kharif (June – October)",
    growingGuide: {
      soilRequirement: "Clayey loam to loamy soil with good water retention.",
      sowingTime: "Nursery: May–June; Transplanting: June–July.",
      irrigationNeeds: "Standing water 2-5 cm during vegetative and reproductive stages."
    }
  };

  const tabs = ['Overview', 'Growing Guide', 'Market', 'More'];
  const fg = crop.fertilizerGuidance;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(7)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">
          {crop.name} - Detailed Information
        </h2>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Top Banner Card: Crop Graphic, Name, Suitability Badge */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Graphic Icon Container */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-inner">
                {crop.icon}
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900">{crop.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {crop.suitability}
                  </span>
                </div>
              </div>
            </div>

            {crop.provenance && (
              <ProvenanceBadge provenance={crop.provenance} />
            )}
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content: Overview (Default matching reference) */}
          {activeTab === 'Overview' && (
            <div className="space-y-3.5">
              {/* "Why it was recommended?" Section */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  Why it was recommended?
                </h4>

                <div className="space-y-2.5">
                  {crop.detailedReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal Growing Season Section */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-2">
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  Ideal Growing Season
                </h4>
                <div className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">
                      {crop.idealSeason}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      Standard cropping window for eastern UP alluvial plain
                    </span>
                  </div>
                </div>
              </div>

              {/* Deterministic ICAR Fertilizer Guidance Section */}
              {fg && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Beaker className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">ICAR Fertilizer Guidance</h4>
                        <span className="text-[10px] text-slate-500">Deterministic agronomic calculation</span>
                      </div>
                    </div>
                    {fg.provenance && <ProvenanceBadge provenance={fg.provenance} />}
                  </div>

                  {/* Calibration Status Banner */}
                  {fg.is_soil_test_calibrated ? (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Field-Calibrated to Your Verified Soil Health Card</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-medium">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Generic Medium-Fertility Benchmark (Upload card on Land Analysis to calibrate)</span>
                    </div>
                  )}

                  {/* Dosage Display if available */}
                  {fg.recommendation ? (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">Urea (N)</span>
                        <span className="text-xs font-black text-slate-900 block mt-1 font-mono">{fg.recommendation.urea}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">DAP (P)</span>
                        <span className="text-xs font-black text-slate-900 block mt-1 font-mono">{fg.recommendation.dap}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">MOP (K)</span>
                        <span className="text-xs font-black text-slate-900 block mt-1 font-mono">{fg.recommendation.mop}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                      {fg.disclaimer}
                    </div>
                  )}

                  {/* Transparent Calculation Lineage & Adjustments */}
                  {fg.soil_test_adjustments && fg.soil_test_adjustments.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] space-y-1.5">
                      <span className="font-bold text-emerald-950 block text-[10px] uppercase tracking-wide">
                        ICAR-STCR Adjustments Applied:
                      </span>
                      {fg.soil_test_adjustments.map((adj, i) => (
                        <p key={i} className="text-emerald-800 leading-snug">
                          • {adj}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Citation & Disclaimer */}
                  <div className="text-[10px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                    <p><strong>Source:</strong> {fg.base_package_citation || fg.provenance?.source}</p>
                    <p>{fg.disclaimer}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Growing Guide */}
          {activeTab === 'Growing Guide' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Agronomic Guidelines</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p><strong>Soil:</strong> {crop.growingGuide?.soilRequirement || 'Loamy fertile soil.'}</p>
                <p><strong>Sowing Window:</strong> {crop.growingGuide?.sowingTime || 'June-July.'}</p>
                <p><strong>Watering:</strong> {crop.growingGuide?.irrigationNeeds || 'Regular moisture.'}</p>
              </div>
            </div>
          )}

          {/* Tab Content: Market */}
          {activeTab === 'Market' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Market Potential & MSP</h4>
              <p className="text-xs text-slate-600">
                High regional procurement support via MSP and steady local Mandi transactions in Gorakhpur and surrounding APMCs.
              </p>
            </div>
          )}

          {/* Tab Content: More */}
          {activeTab === 'More' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-900">Agronomic Disclaimer</h4>
              <p className="text-xs text-slate-600">
                Data sources: ICAR Agronomic Package of Practices & Department of Agriculture. Always confirm fertilizer plans with field soil tests.
              </p>
            </div>
          )}
        </div>

        {/* Action Button: proceeds to Screen 9 (Copilot) */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(9)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Ask AI Farm Copilot about {crop.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
