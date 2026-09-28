import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, Loader2, Circle, Lightbulb, ArrowRight, Satellite } from 'lucide-react';

export default function Screen3Analyzing({ onNavigate, appMode }) {
  // Step progression states: 0 to 6
  // 0: Location
  // 1: Satellite
  // 2: Weather
  // 3: Soil
  // 4: Historical crop
  // 5: Market
  // 6: All completed
  const [activeStep, setActiveStep] = useState(4); // default set to match reference image (historical processing)
  const [autoComplete, setAutoComplete] = useState(false);

  const steps = [
    { id: 1, title: "Location detected", desc: "Coordinates & administrative boundaries" },
    { id: 2, title: "Satellite data (NDVI, land cover, etc.)", desc: "Vegetation index and surface cover" },
    { id: 3, title: "Weather data (temperature, rainfall, etc.)", desc: "Precipitation and thermal records" },
    { id: 4, title: "Soil data (pH, moisture, etc.)", desc: "Regional soil health and moisture estimate" },
    { id: 5, title: "Historical crop data (past crops)", desc: "Multi-year regional cropping records" },
    { id: 6, title: "Market information (mandi prices)", desc: "Nearest APMC market rates" }
  ];

  // Optional auto-timer to demonstrate dynamic processing
  useEffect(() => {
    let timer;
    if (activeStep < 6) {
      timer = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-20">
        <button
          onClick={() => onNavigate(2)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Analyzing Your Land</h2>
        <div className="w-5" />
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col justify-between">
        {/* Animated Satellite & Field Graphic Illustration */}
        <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-sky-50 via-emerald-50/50 to-emerald-100/60 overflow-hidden flex flex-col items-center justify-center border border-emerald-100 shadow-inner">
          {/* Subtle clouds */}
          <div className="absolute top-3 left-6 w-12 h-4 bg-white/70 rounded-full blur-xs" />
          <div className="absolute top-5 right-8 w-16 h-5 bg-white/60 rounded-full blur-xs" />

          {/* Orbiting Satellite */}
          <div className="relative z-10 flex flex-col items-center animate-bounce duration-1000">
            <div className="relative p-2.5 rounded-full bg-white shadow-md text-emerald-700 border border-emerald-200">
              <Satellite className="w-8 h-8 rotate-45 text-emerald-600" />
            </div>
            {/* Pulsing signal beams radiating downwards */}
            <div className="w-16 h-8 border-b-2 border-dashed border-emerald-500 rounded-full animate-ping opacity-50 -mt-2" />
          </div>

          {/* Green Contoured Field Landscape (SVG) */}
          <div className="absolute bottom-0 inset-x-0 h-16 flex items-end">
            <svg viewBox="0 0 400 120" className="w-full h-full preserve-3d" preserveAspectRatio="none">
              <path d="M0,70 Q100,20 200,60 T400,30 L400,120 L0,120 Z" fill="#15803d" opacity="0.3" />
              <path d="M0,85 Q120,45 240,75 T400,60 L400,120 L0,120 Z" fill="#16a34a" opacity="0.7" />
              <path d="M0,95 Q150,70 300,90 T400,80 L400,120 L0,120 Z" fill="#22c55e" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Heading text */}
        <div className="text-center py-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Analyzing your field...</h3>
          <p className="text-xs text-slate-500">This may take a few moments</p>
        </div>

        {/* Sequential Progress Checklist */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 my-2">
          {steps.map((step, idx) => {
            const isDone = activeStep > idx;
            const isCurrent = activeStep === idx;
            const isWaiting = activeStep < idx;

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5 shrink-0">
                  {isDone && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  )}
                  {isCurrent && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                  {isWaiting && (
                    <Circle className="w-4 h-4 text-slate-300 stroke-[1.5]" />
                  )}
                </div>

                {/* Step Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDone ? 'text-slate-800' : isCurrent ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {isDone ? 'Completed' : isCurrent ? 'Processing...' : 'Waiting...'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Did You Know Box */}
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/70 flex items-start gap-2.5 my-1">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed text-left">
            <strong className="font-semibold text-amber-950">Did you know?</strong> We combine satellite imagery, meteorological reanalysis and official APMC market records to evaluate your field.
          </p>
        </div>

        {/* Action Button: proceeds to report */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(4)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeStep >= 5
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <span>{activeStep >= 6 ? "View Analysis Report" : "Skip to Report"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
