import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Globe
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  getCurrentLanguage,
  setCurrentLanguage,
  subscribeLanguage,
  translateDOMSubtree
} from '../services/i18n';

const MODULE_TABS = [
  {
    id: 'advisory',
    target: 1,
    emoji: '🌾',
    label: 'Advisory (1-9)',
    sublabel: '9-Step Crop Advisory',
    isActive: (screen) => typeof screen === 'number' && screen >= 1 && screen <= 9
  },
  {
    id: 'simulator',
    target: 10,
    emoji: '⚖️',
    label: 'Simulator (10)',
    sublabel: 'What-If Crop Comparison',
    isActive: (screen) => screen === 10 || screen === 'simulator'
  },
  {
    id: 'farm-plan',
    target: 11,
    emoji: '📋',
    label: 'Farm Plan (11)',
    sublabel: 'Personalized Action Plan',
    isActive: (screen) => screen === 11 || screen === 'farm-plan'
  },
  {
    id: 'disease',
    target: 'disease',
    emoji: '🔬',
    label: 'Disease AI',
    sublabel: 'Leaf Diagnostics',
    isActive: (screen) => screen === 'disease'
  },
  {
    id: 'dashboard',
    target: 'dashboard',
    emoji: '📊',
    label: 'State Dashboard',
    sublabel: 'Regional Telemetry',
    isActive: (screen) => screen === 'dashboard'
  },
  {
    id: 'login',
    target: 'login',
    emoji: '🔑',
    label: 'Login / Auth',
    sublabel: 'Farmer Account',
    isActive: (screen) => screen === 'login'
  }
];

const ADVISORY_STEPS = [
  { id: 1, label: '1. Home' },
  { id: 2, label: '2. Detect Land' },
  { id: 3, label: '3. Analyzing' },
  { id: 4, label: '4. Land Analysis' },
  { id: 5, label: '5. Cropping Pattern' },
  { id: 6, label: '6. Market & Mandi' },
  { id: 7, label: '7. Recommendations' },
  { id: 8, label: '8. Crop Details' },
  { id: 9, label: '9. Ask Copilot' }
];

export default function MobileFrame({
  children,
  currentScreen,
  onNavigate,
  appMode,
  setAppMode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [advisoryExpanded, setAdvisoryExpanded] = useState(true);
  const [selectedLang, setSelectedLang] = useState(getCurrentLanguage());
  const phoneRef = useRef(null);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen((prev) => !prev);
    window.addEventListener('toggle-phone-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-phone-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    return subscribeLanguage((newLang) => {
      setSelectedLang(newLang);
    });
  }, []);

  // Automatically translate the phone screen whenever language, screen, or DOM content changes
  useEffect(() => {
    const root = phoneRef.current;
    if (!root) return;

    let timer = null;
    let isTranslating = false;

    const runTranslation = async () => {
      if (isTranslating) return;
      isTranslating = true;
      try {
        await translateDOMSubtree(root, selectedLang);
      } finally {
        isTranslating = false;
      }
    };

    runTranslation();

    const observer = new MutationObserver(() => {
      if (selectedLang === 'EN' || isTranslating) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        runTranslation();
      }, 80);
    });

    observer.observe(root, {
      childList: true,
      subtree: true
    });

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [selectedLang, currentScreen, sidebarOpen]);

  const getScreenLabel = () => {
    if (typeof currentScreen === 'number') return `${currentScreen} / 11`;
    if (currentScreen === 'simulator') return '10 / 11';
    if (currentScreen === 'farm-plan') return '11 / 11';
    if (currentScreen === 'disease') return 'Disease AI';
    if (currentScreen === 'dashboard') return 'Dashboard';
    if (currentScreen === 'login') return 'Login / Auth';
    return String(currentScreen);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 select-none font-sans text-slate-800">
      {/* Main Mobile Screen Chassis */}
      <div
        ref={phoneRef}
        className="w-full max-w-[400px] h-[100dvh] sm:h-[844px] sm:max-h-[90vh] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] sm:border-slate-800 transition-all"
      >
        {/* Mobile Status Bar + Sidebar Trigger + Mode Switcher Inside Phone */}
        <div className="bg-white px-4 pt-2.5 pb-1.5 flex items-center justify-between text-xs font-semibold text-slate-800 z-30 select-none border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
              title="Open Tabs Sidebar"
            >
              <Menu className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[10px] font-bold tracking-tight">Tabs</span>
            </button>
            <span className="tracking-tight text-xs font-bold text-slate-900">9:41</span>
          </div>

          {/* Dynamic Island / Speaker Notch Simulation */}
          <div className="w-16 h-4 bg-slate-900 rounded-full hidden sm:block mx-auto" />

          <div className="flex items-center gap-1.5 text-slate-800">
            {setAppMode && (
              <button
                onClick={() => setAppMode(appMode === 'DEMO' ? 'REAL' : 'DEMO')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                  appMode === 'DEMO'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
                title={`Switch mode (Current: ${appMode})`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${appMode === 'DEMO' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span>{appMode === 'REAL' ? 'LIVE' : 'DEMO'}</span>
              </button>
            )}
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* In-Phone Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-40 transition-opacity"
          />
        )}

        {/* In-Phone Slide-Out Left Sidebar */}
        <aside
          className={`absolute inset-y-0 left-0 z-50 w-[280px] max-w-[82%] bg-slate-950 text-slate-200 border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate">
                <div className="font-bold tracking-wide uppercase text-xs text-emerald-400 leading-tight">
                  AgriNexus / FarmAI
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Module Switcher
                </div>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Tabs List */}
          <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1.5">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation Tabs
            </div>

            {MODULE_TABS.map((tab) => {
              const active = tab.isActive(currentScreen);
              const isAdvisory = tab.id === 'advisory';

              return (
                <div key={tab.id} className="space-y-1">
                  <button
                    onClick={() => {
                      onNavigate(tab.target);
                      if (isAdvisory) {
                        setAdvisoryExpanded(true);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                      active
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950/50'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white font-medium border border-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none shrink-0">{tab.emoji}</span>
                      <div className="min-w-0">
                        <div className="truncate text-xs leading-tight">{tab.label}</div>
                        <div
                          className={`truncate text-[10px] leading-tight mt-0.5 ${
                            active ? 'text-slate-900/80 font-medium' : 'text-slate-500 group-hover:text-slate-400'
                          }`}
                        >
                          {tab.sublabel}
                        </div>
                      </div>
                    </div>

                    {isAdvisory && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdvisoryExpanded(!advisoryExpanded);
                        }}
                        className={`p-0.5 rounded transition-transform ${
                          active ? 'text-slate-950 hover:bg-emerald-600/30' : 'text-slate-400 hover:bg-slate-700'
                        } ${advisoryExpanded ? 'rotate-180' : ''}`}
                        title="Toggle screens 1-9"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>

                  {/* Sub-navigation for Advisory Screens (1-9) */}
                  {isAdvisory && advisoryExpanded && (
                    <div className="pl-3 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800 ml-3.5">
                      {ADVISORY_STEPS.map((step) => {
                        const stepActive = currentScreen === step.id;
                        return (
                          <button
                            key={step.id}
                            onClick={() => {
                              onNavigate(step.id);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                              stepActive
                                ? 'bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30'
                                : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate">{step.label}</span>
                            {stepActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: Language, Mode Switcher & Screen Stepper */}
          <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950">
            {/* Language Pills */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold px-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>Language</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className={`py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      selectedLang === lang.code
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                    title={lang.label}
                  >
                    {lang.code}
                  </button>
                ))}
              </div>
            </div>

            {setAppMode && (
              <button
                onClick={() => setAppMode(appMode === 'DEMO' ? 'REAL' : 'DEMO')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  appMode === 'DEMO'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                <span className="text-slate-400">Execution Mode</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      appMode === 'DEMO' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                    }`}
                  />
                  <span>{appMode}</span>
                </span>
              </button>
            )}

            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  if (typeof currentScreen === 'number') {
                    onNavigate(Math.max(1, currentScreen - 1));
                  } else {
                    onNavigate(1);
                  }
                }}
                disabled={currentScreen === 1}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Previous screen"
              >
                <ChevronLeft className="w-4 h-4 text-slate-200" />
              </button>
              <span className="px-1 font-bold text-slate-200 text-[11px] text-center truncate">
                {getScreenLabel()}
              </span>
              <button
                onClick={() => {
                  if (typeof currentScreen === 'number') {
                    onNavigate(Math.min(11, currentScreen + 1));
                  } else {
                    onNavigate(1);
                  }
                }}
                disabled={currentScreen === 11}
                className="p-1 rounded-lg hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                title="Next screen"
              >
                <ChevronRight className="w-4 h-4 text-slate-200" />
              </button>
            </div>
          </div>
        </aside>

        {/* Active Screen Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 flex flex-col relative">
          {children}
        </div>

        {/* Mobile Bottom Home Indicator Bar */}
        <div className="bg-white py-1.5 flex justify-center items-center z-20 border-t border-slate-100">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

