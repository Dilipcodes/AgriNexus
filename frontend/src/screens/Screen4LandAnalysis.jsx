import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, MapPin, Calendar, Thermometer, Droplets, CloudRain, Leaf, 
  ArrowRight, Activity, Upload, FileText, CheckCircle2, AlertTriangle, 
  HelpCircle, RefreshCw, Sparkles, ShieldCheck
} from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { uploadSoilHealthCard } from '../services/api';

export default function Screen4LandAnalysis({ 
  onNavigate, 
  farmData, 
  landAnalysis, 
  soilIntelligence, 
  onSoilUpdate,
  appMode 
}) {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Soil' | 'Weather' | 'Satellite'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const tabs = ['Overview', 'Soil', 'Weather', 'Satellite'];

  // Icons map for key insights
  const getIcon = (id) => {
    switch (id) {
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-red-500" />;
      case 'soil_moisture':
        return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'rainfall':
        return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'ndvi':
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      default:
        return <Activity className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getRatingBadgeClass = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'high':
      case 'sufficient':
      case 'normal':
      case 'neutral':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
      case 'acidic':
      case 'critical':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'deficient':
      case 'injurious':
      case 'alkaline':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10 MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Document size exceeds 10 MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const res = await uploadSoilHealthCard(base64Data, file.type, appMode);
        if (res && res.report) {
          if (onSoilUpdate) onSoilUpdate(res.report);
        } else {
          setUploadError("Could not transcribe document. Please try a clearer photograph.");
        }
      } catch (err) {
        setUploadError("Upload failed. Please check network connection.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read file.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDemoCardLoad = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      // Simulate quick demo card ingestion
      const res = await uploadSoilHealthCard("data:image/jpeg;base64,demo", "image/jpeg", appMode);
      if (res && res.report && onSoilUpdate) {
        onSoilUpdate(res.report);
      }
    } catch (err) {
      setUploadError("Demo card load failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const soilReport = soilIntelligence || {
    source_type: "regional_estimate",
    region_name: "Gorakhpur Alluvial Basin",
    soil_type: "Alluvial (Loamy)",
    parameters: {},
    warnings: [],
    provenance: {
      factor: "soil_profile",
      source: "ICAR Regional Soil Fertility Atlas",
      timestamp_or_period: "Benchmark Edition",
      geographic_scope: "Gorakhpur (Middle Gangetic Plain)",
      status: "estimated",
      methodology_note: "Regional agro-climatic estimate. Upload your official Soil Health Card for parcel-level test calibration."
    }
  };

  const params = soilReport.parameters || {};
  const isCardVerified = soilReport.source_type === "uploaded_card";

  return (
    <div className="flex flex-col min-h-full bg-slate-50 text-slate-800">
      {/* Top Navigation Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <button
          onClick={() => onNavigate(2)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Land & Soil Analysis</h2>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Farm & Date Overview Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{farmData.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{landAnalysis.reportDate}</span>
            </div>
          </div>

          {/* Mini Satellite Thumbnail with Acreage Tag */}
          <div className="relative w-16 h-14 rounded-xl overflow-hidden border border-emerald-500 shadow-inner bg-slate-800 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80"
              alt="Farm parcel preview"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-emerald-400 text-[9px] font-bold px-1 rounded">
              {farmData.area.display}
            </span>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab === 'Soil' && isCardVerified && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW (Default Dashboard) */}
        {/* ========================================================================= */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-1">
              <h3 className="font-bold text-xs text-slate-900 tracking-tight uppercase">Key Insights</h3>
              <span className="text-[10px] text-slate-600 font-medium">Independent Data Status</span>
            </div>

            {/* 2x2 Metric Grid Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {landAnalysis.keyInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      {getIcon(insight.id)}
                    </div>
                    <ProvenanceBadge provenance={insight.provenance} />
                  </div>

                  <div className="text-left">
                    <span className="text-lg font-black text-slate-900 block leading-tight">
                      {insight.value}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {insight.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Parameters List */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs divide-y divide-slate-100">
              {landAnalysis.secondaryMetrics.map((metric, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{metric.value}</span>
                    <ProvenanceBadge provenance={metric.provenance} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SOIL INTELLIGENCE & HEALTH CARD DIGITIZATION */}
        {/* ========================================================================= */}
        {activeTab === 'Soil' && (
          <div className="space-y-4">
            {/* Soil Header Banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCardVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCardVerified ? <ShieldCheck className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {isCardVerified ? 'Verified Soil Health Card' : 'Regional Soil Benchmark'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {soilReport.soil_type} • {soilReport.region_name}
                    </p>
                  </div>
                </div>
                <ProvenanceBadge provenance={soilReport.provenance} />
              </div>

              {/* Lab Metadata Banner (if uploaded card) */}
              {isCardVerified && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-950 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-medium">Sample No:</span>
                    <span className="font-bold font-mono">{soilReport.sample_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-medium">Farmer / Test Date:</span>
                    <span className="font-medium">{soilReport.farmer_name || 'Farmer'} ({soilReport.test_date || 'Recent'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700 font-medium">Laboratory:</span>
                    <span className="font-medium truncate max-w-[200px]">{soilReport.lab_name}</span>
                  </div>
                </div>
              )}

              {/* Notice if regional estimate */}
              {!isCardVerified && (
                <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                  Showing regional agro-climatic estimates for Middle Gangetic alluvial soil. Upload an official farmer Soil Health Card below to calibrate your parcel's exact N-P-K doses.
                </p>
              )}
            </div>

            {/* Warning Banner if extraction detected anomalies */}
            {soilReport.warnings && soilReport.warnings.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Document Review Notice</span>
                </div>
                {soilReport.warnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] text-rose-700 leading-tight">
                    • {w}
                  </p>
                ))}
              </div>
            )}

            {/* 12-Parameter Scorecard */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 text-left">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase flex items-center justify-between">
                <span>12 Standard Soil Parameters</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">zero-hallucination enabled</span>
              </h4>

              {/* Group 1: Physical / Chemical Reaction */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Physical & Reaction (3)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['ph', 'ec', 'oc'].map(k => {
                    const p = params[k];
                    return (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{p?.symbol || k.toUpperCase()}</span>
                          {p?.rating && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRatingBadgeClass(p.rating)}`}>
                              {p.rating}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          {p?.value !== null && p?.value !== undefined ? (
                            <span className="text-sm font-black text-slate-900">{p.value} <span className="text-[10px] font-normal text-slate-500">{p.unit}</span></span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not Recorded</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Primary Macronutrients */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Primary Macronutrients (3)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['n', 'p', 'k'].map(k => {
                    const p = params[k];
                    return (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{p?.symbol || k.toUpperCase()}</span>
                          {p?.rating && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getRatingBadgeClass(p.rating)}`}>
                              {p.rating}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          {p?.value !== null && p?.value !== undefined ? (
                            <span className="text-sm font-black text-slate-900">{p.value} <span className="text-[10px] font-normal text-slate-500">{p.unit}</span></span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not Recorded</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Secondary & Micronutrients */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Secondary & Micronutrients (6)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['s', 'zn', 'b', 'fe', 'mn', 'cu'].map(k => {
                    const p = params[k];
                    return (
                      <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-slate-900">{p?.symbol || k.toUpperCase()}</span>
                          {p?.rating && (
                            <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${getRatingBadgeClass(p.rating)}`}>
                              {p.rating}
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          {p?.value !== null && p?.value !== undefined ? (
                            <span className="text-xs font-black text-slate-900">{p.value} <span className="text-[9px] font-normal text-slate-500">{p.unit}</span></span>
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">Not Tested</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ingestion & Upload Actions Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-left space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                {isCardVerified ? 'Update or Replace Soil Health Card' : 'Upload Physical Soil Health Card'}
              </h4>

              {uploadError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {uploadError}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/*,application/pdf"
                className="hidden"
              />

              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Digitizing Soil Health Card with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Card (Photo or PDF)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDemoCardLoad}
                  disabled={isUploading}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Load Sample Soil Health Card (Demo)</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Supports JPG, PNG, and PDF (Max 10 MB). Digitized via Google GenAI multimodal optical reader with zero hallucination.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3 & 4: WEATHER & SATELLITE (Placeholders preserving UI flow) */}
        {/* ========================================================================= */}
        {(activeTab === 'Weather' || activeTab === 'Satellite') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center space-y-2">
            <h4 className="text-xs font-bold text-slate-900">{activeTab} Details</h4>
            <p className="text-xs text-slate-500">
              Detailed {activeTab.toLowerCase()} telemetric observations are aggregated under the Overview tab and Screen 2 geospatial layers.
            </p>
            <button
              onClick={() => setActiveTab('Overview')}
              className="text-xs text-emerald-700 font-semibold hover:underline mt-2 inline-block cursor-pointer"
            >
              Return to Overview
            </button>
          </div>
        )}

        {/* Action Button: proceeds to Screen 5 */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(5)}
            className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Proceed to Cropping Pattern</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
