import React from 'react';
import { ChevronLeft, Info, Sprout, ArrowRight, RotateCw, History, Check } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function Screen5CroppingPattern({ onNavigate, croppingPattern, appMode }) {
  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(4)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Local Cropping Pattern</h2>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Subheader with timeframe and provenance badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
              <span>{croppingPattern.timeframe}</span>
              <Info className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <ProvenanceBadge provenance={croppingPattern.provenance} />
          </div>

          {/* Horizontal Proportional Bar Chart Container */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
            {croppingPattern.crops.map((crop, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Crop Icon Badge */}
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-xs shrink-0 border border-slate-200/60">
                  {crop.icon}
                </div>

                {/* Crop Name */}
                <span className="w-14 text-xs font-semibold text-slate-800 text-left">
                  {crop.name}
                </span>

                {/* Progress Bar */}
                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${crop.percentage}%`,
                      backgroundColor: crop.color
                    }}
                  />
                </div>

                {/* Percentage Value */}
                <span className="w-8 text-right text-xs font-bold text-slate-800">
                  {crop.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Rotational Context Cards */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs divide-y divide-slate-100 space-y-2">
            {/* Previous Season */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="text-base">🌾</span>
                <span>Previous season crop</span>
              </div>
              <span className="font-bold text-slate-900">{croppingPattern.history.previousSeasonCrop}</span>
            </div>

            {/* Currently Detected */}
            <div className="flex items-center justify-between text-xs pt-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Currently detected crop</span>
              </div>
              <span className="font-bold text-emerald-700 text-right text-[11px]">
                {croppingPattern.history.currentlyDetectedCrop}
              </span>
            </div>

            {/* Common Pattern */}
            <div className="flex items-center justify-between text-xs pt-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <RotateCw className="w-4 h-4 text-blue-600" />
                <span>Common cropping pattern</span>
              </div>
              <span className="font-bold text-slate-900">{croppingPattern.history.commonRotation}</span>
            </div>
          </div>

          {/* Official Disclaimer Note (Matching PDF Data Reality Check) */}
          <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex items-start gap-2 text-left">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {croppingPattern.note}
            </p>
          </div>
        </div>

        {/* Action Button: proceeds to Screen 6 (Mandi Prices) */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(6)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>View Market & Mandi Prices</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
