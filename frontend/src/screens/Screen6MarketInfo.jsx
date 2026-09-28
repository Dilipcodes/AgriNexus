import React, { useState } from 'react';
import { ChevronLeft, MapPin, Info, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function Screen6MarketInfo({ onNavigate, marketInfo, appMode }) {
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' | 'trend'

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(5)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Nearby Mandi Prices</h2>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3.5">
          {/* Nearest Mandi Card */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-start gap-2.5 text-left">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mt-0.5 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    Nearest mandi: {marketInfo.mandiName}
                  </h3>
                  <ProvenanceBadge provenance={marketInfo.provenance} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Distance: {marketInfo.distance}
                </p>
              </div>
            </div>
            <button
              onClick={() => alert("Change mandi: Search other APMC markets")}
              className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Toggle Segmented Switch (Latest Prices / Price Trend) */}
          <div className="bg-slate-200/70 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'latest'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Latest Prices
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'trend'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Price Trend
            </button>
          </div>

          {/* Mandi Price Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 grid grid-cols-12 items-center text-left">
              <span className="col-span-5">Crop</span>
              <div className="col-span-7 flex justify-between text-right">
                <span className="w-12">Min</span>
                <span className="w-12">Max</span>
                <span className="w-12 text-emerald-800">Modal</span>
              </div>
            </div>

            {/* Price Column Unit Indicator */}
            <div className="bg-emerald-50/50 px-3.5 py-1 text-[10px] font-medium text-emerald-900 border-b border-emerald-100 text-right">
              Price (₹ / Quintal)
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100 text-xs">
              {marketInfo.table.map((row, idx) => (
                <div key={idx} className="px-3.5 py-3 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors">
                  {/* Crop Name & Icon */}
                  <div className="col-span-5 flex items-center gap-2 text-left">
                    <span className="text-base">{row.icon}</span>
                    <span className="font-bold text-slate-800">{row.crop}</span>
                  </div>

                  {/* Prices */}
                  <div className="col-span-7 flex justify-between text-right font-medium text-slate-600 text-[11px]">
                    <span className="w-12 font-mono">₹{row.min}</span>
                    <span className="w-12 font-mono">₹{row.max}</span>
                    <span className="w-12 font-mono font-bold text-slate-900 text-xs">
                      ₹{row.modal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Link */}
            <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/40">
              <button
                onClick={() => alert("Displaying all 15 regional APMC commodities.")}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View more crops</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* AGMARKNET Legal / Practical Disclaimer */}
          <div className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex items-start gap-2 text-left">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {marketInfo.disclaimer}
            </p>
          </div>
        </div>

        {/* Action Button: proceeds to Screen 7 (Crop Recommendations) */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(7)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>See Recommended Crops</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
