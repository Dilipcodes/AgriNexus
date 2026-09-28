import React, { useState } from 'react';
import { Info, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function ProvenanceBadge({ provenance, className = "" }) {
  const [showDetail, setShowDetail] = useState(false);

  if (!provenance) return null;

  const status = provenance.status || 'demo';

  // Distinct styling for each provenance status
  const badgeConfig = {
    live: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
      dot: "bg-emerald-500",
      label: "Live"
    },
    verified: {
      bg: "bg-blue-50 text-blue-700 border-blue-300",
      dot: "bg-blue-500",
      label: "Verified"
    },
    estimated: {
      bg: "bg-purple-50 text-purple-700 border-purple-300",
      dot: "bg-purple-500",
      label: "Estimated"
    },
    demo: {
      bg: "bg-amber-50 text-amber-800 border-amber-300",
      dot: "bg-amber-500",
      label: "Demo"
    }
  };

  const config = badgeConfig[status] || badgeConfig.demo;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowDetail(!showDetail);
        }}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-all hover:shadow-xs ${config.bg}`}
        title="Click to view data provenance and source integrity details"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{config.label}</span>
        <Info className="w-2.5 h-2.5 opacity-60" />
      </button>

      {/* Detail Popover / Tooltip */}
      {showDetail && (
        <div
          className="absolute z-50 right-0 mt-1 w-64 p-3 bg-white rounded-xl shadow-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b pb-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Data Provenance
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${config.bg}`}>
              {config.label.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-[10px] text-slate-600 uppercase font-semibold">Source</p>
            <p className="text-slate-800 font-medium">{provenance.source}</p>
          </div>

          {provenance.geographic_scope && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase font-semibold">Scope</p>
              <p className="text-slate-700">{provenance.geographic_scope}</p>
            </div>
          )}

          {provenance.timestamp_or_period && (
            <div>
              <p className="text-[10px] text-slate-600 uppercase font-semibold">Timestamp / Period</p>
              <p className="text-slate-700">{provenance.timestamp_or_period}</p>
            </div>
          )}

          {provenance.methodology_note && (
            <div className="bg-slate-50 p-1.5 rounded text-[11px] text-slate-600 leading-snug border border-slate-100">
              {provenance.methodology_note}
            </div>
          )}

          <div className="pt-1 text-right">
            <button
              onClick={() => setShowDetail(false)}
              className="text-[10px] text-emerald-700 font-semibold hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
