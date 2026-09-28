import React from 'react';
import { MapPin, ShieldCheck, Sprout, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function Screen1Home({ onNavigate, appMode, setAppMode, provenance }) {
  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800">
      {/* Top Header */}
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        currentScreen={1}
        onNavigate={onNavigate}
      />

      {/* Hero Visual Area with Agricultural Imagery */}
      <div className="relative overflow-hidden px-5 pt-4 pb-2 bg-gradient-to-b from-emerald-50/70 to-white flex-1 flex flex-col justify-between">
        {/* Scenic Illustrated Agricultural Landscape Banner */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden shadow-inner mb-4 bg-emerald-900">
          <img
            src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
            alt="Farmer in agricultural field"
            className="w-full h-full object-cover object-center opacity-85"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
            }}
          />
          {/* Subtle gradient overlay to make text pop if over image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
          
          <div className="absolute top-2 right-2">
            <ProvenanceBadge provenance={provenance} />
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-2 text-left mb-5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Find the right crop <br />
            <span className="text-emerald-700">for your land</span>
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Analyze your land using satellite, weather, soil and local crop data.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={() => onNavigate(2)}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            <MapPin className="w-4 h-4 fill-white text-emerald-700" />
            <span>Detect My Land</span>
          </button>

          <button
            onClick={() => onNavigate(2)}
            className="w-full text-center text-xs font-semibold text-slate-600 hover:text-emerald-700 py-1 transition-colors cursor-pointer"
          >
            Or select manually
          </button>
        </div>

        {/* Value Proposition Highlights (3 items matching reference) */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Accurate</span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">Insights</span>
          </div>

          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1.5 shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Better</span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">Yields</span>
          </div>

          <div className="flex flex-col items-center text-center p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-1.5 shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Higher</span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">Income</span>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="py-4 text-center">
          <p className="text-xs font-serif italic text-emerald-800 flex items-center justify-center gap-1.5 opacity-90">
            For a sustainable tomorrow 🍃
          </p>
        </div>
      </div>
    </div>
  );
}
