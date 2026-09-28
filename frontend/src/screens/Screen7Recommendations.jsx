import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function Screen7Recommendations({
  onNavigate,
  recommendations,
  onSelectCrop,
  appMode
}) {
  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(6)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Crop Recommendation</h2>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Section Heading */}
        <div className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Top Recommended Crops
            </h3>
            <ProvenanceBadge provenance={recommendations[0]?.provenance} />
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Based on your land conditions, local data and market trends
          </p>
        </div>

        {/* List of Ranked Crop Recommendation Cards */}
        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isHigh = rec.badgeType === 'high';

            return (
              <div
                key={rec.id}
                onClick={() => {
                  onSelectCrop(rec);
                  onNavigate(8);
                }}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer text-left relative group"
              >
                {/* Top Row: Rank, Thumbnail, Crop Name, Suitability Badge, Arrow */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Rank Badge */}
                    <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {rec.rank}
                    </span>

                    {/* Crop Icon Thumbnail */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-lg shrink-0">
                      {rec.icon}
                    </div>

                    {/* Crop Name */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {rec.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Suitability Pill Badge (Calibrated tier, not uncalibrated percentage) */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {rec.suitability}
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>

                {/* Rationale Checklist (Matching reference layout) */}
                <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                  {rec.summaryReasons.map((reason, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px]">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Personalized Farm Plan Entry Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-2xl p-3.5 shadow-sm space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Personalized Farm Plan</h4>
                <p className="text-[10px] text-emerald-100">Full 9-section ICAR operational roadmap & timeline</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate(11)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>View Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* What-If Scenario Simulator Entry Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm space-y-2 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">What-If Scenario Simulator</h4>
                <p className="text-[10px] text-slate-300">Compare Rice vs. Maize vs. Wheat side-by-side</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate(10)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <span>Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Help banner / Transition link */}
        <div className="pt-1">
          <button
            onClick={() => onNavigate(9)}
            className="w-full py-3 px-4 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Have questions? Ask FarmAI Copilot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
