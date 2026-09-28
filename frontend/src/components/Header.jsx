import React, { useState, useEffect } from 'react';
import { Sprout, Menu, ChevronDown, Globe } from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  setCurrentLanguage,
  subscribeLanguage
} from '../services/i18n';

export default function Header({ appMode, setAppMode, currentScreen, onNavigate }) {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguage((newLang) => {
      setSelectedLang(newLang);
    });
  }, []);

  return (
    <header className="bg-white border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand */}
      <div 
        onClick={() => onNavigate(1)}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
          <Sprout className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-lg tracking-tight leading-tight">
              Farm<span className="text-emerald-600">AI</span>
            </span>
          </div>
          <p className="text-[9px] text-slate-500 font-medium leading-none">
            Smarter Farming, Brighter Tomorrow
          </p>
        </div>
      </div>

      {/* Controls: Mode Switcher, Language & Hamburger */}
      <div className="flex items-center gap-2">
        {/* Mode Pill Toggle */}
        <button
          onClick={() => setAppMode(appMode === 'DEMO' ? 'REAL' : 'DEMO')}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
            appMode === 'DEMO'
              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title={`Click to switch mode. Current: ${appMode} Mode (Independent per-source provenance is strictly maintained)`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${appMode === 'DEMO' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>{appMode}</span>
        </button>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>{selectedLang}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 transition-colors cursor-pointer ${
                    selectedLang === lang.code ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hamburger Menu Toggle -> Opens Phone Sidebar */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-phone-sidebar'))}
          className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

