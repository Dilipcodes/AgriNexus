import React, { useState } from 'react';
import { ChevronLeft, BarChart3, TrendingUp, Users, MapPin, Calendar, Building2, DollarSign, Filter, Info, ShieldCheck, Sprout, ArrowUpRight } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { FILTER_OPTIONS, getDashboardData } from '../services/dashboardService';

export default function ScreenStateDashboard({ onNavigate, appMode }) {
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Gorakhpur');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedPeriod, setSelectedPeriod] = useState('2023 - 2024');

  const availableDistricts = FILTER_OPTIONS.districtsByState[selectedState] || ['Gorakhpur'];
  const data = getDashboardData(selectedState, selectedDistrict, appMode, selectedPeriod);
  const regional = data.regionalStats;
  const appIntel = data.appIntelligence;

  // Filter crops if specific crop selected
  const filteredCrops = selectedCrop === 'All Crops'
    ? regional.cropBreakdown
    : regional.cropBreakdown.filter(c => c.crop.toLowerCase() === selectedCrop.toLowerCase());

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(1)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Building2 className="w-3 h-3" />
          </div>
          <h2 className="font-bold text-sm text-slate-900 tracking-tight">Regional Agriculture Dashboard</h2>
        </div>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Navigation Dropdown Filters: State -> District -> Crop -> Time Period */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5 text-left">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Regional Filters
            </span>
            <ProvenanceBadge provenance={regional.provenance} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* State Selector */}
            <div>
              <label className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  const newState = e.target.value;
                  setSelectedState(newState);
                  const firstDist = FILTER_OPTIONS.districtsByState[newState]?.[0] || 'Gorakhpur';
                  setSelectedDistrict(firstDist);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {FILTER_OPTIONS.states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* District Selector */}
            <div>
              <label className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">Crop Filter</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {FILTER_OPTIONS.crops.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Time Period Selector */}
            <div>
              <label className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
              >
                {FILTER_OPTIONS.periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 1. Overview Cards (Official/Regional Statistics) */}
        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Regional Agricultural Overview
            </h3>
            <span className="text-[10px] text-slate-600 font-medium">Official Benchmark</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Total Crop Area</span>
              <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{regional.overview.totalAreaHa}</span>
              <span className="text-[10px] text-emerald-700 font-medium">+1.8% vs last year</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Total Production</span>
              <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{regional.overview.totalProductionMT}</span>
              <span className="text-[10px] text-emerald-700 font-medium">+3.2% yield recovery</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Dominant Crop</span>
              <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{regional.overview.majorCrop}</span>
              <span className="text-[10px] text-slate-500">Kharif harvest season</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-600 font-semibold block uppercase">Crops Monitored</span>
              <span className="text-base font-black text-slate-900 block leading-tight mt-0.5">{regional.overview.cropsTrackedCount} Commodities</span>
              <span className="text-[10px] text-slate-500">APMC & DES registry</span>
            </div>
          </div>
        </div>

        {/* 2. Crop Production & Yield Table */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Crop Production & Yield
            </h4>
            <span className="text-[10px] text-slate-500">{selectedPeriod}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {filteredCrops.map((c, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{c.crop}</span>
                  <span className="text-[11px] text-slate-500">Area: {c.areaHa}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">{c.productionMT}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Yield: {c.yieldQtlHa} ({c.trendYoY})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Regional Crop Distribution Visual Chart */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Regional Cultivated Area Share
          </h4>

          {/* Stacked Proportional Bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {regional.cropBreakdown.map((c, idx) => (
              <div
                key={idx}
                style={{ width: `${c.areaShare}%`, backgroundColor: c.color }}
                title={`${c.crop}: ${c.areaShare}%`}
                className="h-full"
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            {regional.cropBreakdown.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="font-semibold text-slate-700 truncate">{c.crop}: {c.areaShare}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Market Intelligence */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Market Intelligence (APMC Rates)
            </h4>
            <span className="text-[10px] text-emerald-700 font-bold">{regional.marketIntelligence.priceTrend}</span>
          </div>

          <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase">Benchmark Rate (Rice)</span>
              <span className="font-bold text-emerald-950 text-sm">{regional.marketIntelligence.latestModalPrice}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Daily Arrivals</span>
              <span className="font-bold text-slate-800">{regional.marketIntelligence.arrivalsDaily}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-600 block">Key Mandis in District:</span>
            {regional.marketIntelligence.nearbyMandis.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-700">{m.name} ({m.distance})</span>
                <span className="font-mono font-bold text-slate-900">{m.modalPrice}/Qtl</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. AGRINEXUS APP INTELLIGENCE (STRICT SEPARATION) */}
        <div className="bg-gradient-to-b from-emerald-50/90 to-white rounded-2xl p-4 border-2 border-emerald-200 shadow-sm text-left space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  5. AgriNexus Platform Telemetry
                </h4>
              </div>
              <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                Application-Derived Adoption Data Only
              </p>
            </div>
            <ProvenanceBadge provenance={appIntel.provenance} />
          </div>

          {/* Explicit Mandated Separation Disclaimer */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-[10px] text-slate-600 leading-relaxed">
            <strong>Platform Boundary Notice:</strong> {appIntel.disclaimer}
          </div>

          {/* Platform Adoption Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
              <span className="text-[10px] text-slate-500 font-medium block">Registered Users</span>
              <span className="text-sm font-bold text-emerald-950 mt-0.5 block">{appIntel.summary.registeredUsersDisplay}</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-100/80">
              <span className="text-[10px] text-slate-500 font-medium block">Declared Farm Area</span>
              <span className="text-sm font-bold text-emerald-950 mt-0.5 block">{appIntel.summary.onboardedAreaAcres}</span>
            </div>
          </div>

          {/* User Crop Distribution */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-700 block">
              Declared Crops by AgriNexus Farmers:
            </span>
            <div className="space-y-1.5 text-xs">
              {appIntel.userCropDistribution.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-800">{item.crop}</span>
                    <span className="text-[10px] text-slate-400">({item.usersCount.toLocaleString()} farmers)</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.sharePercent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(1)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            Return to Farmer Advisory Journey
          </button>
        </div>
      </div>
    </div>
  );
}
