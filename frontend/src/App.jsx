import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import Screen1Home from './screens/Screen1Home';
import Screen2DetectLand from './screens/Screen2DetectLand';
import Screen3Analyzing from './screens/Screen3Analyzing';
import Screen4LandAnalysis from './screens/Screen4LandAnalysis';
import Screen5CroppingPattern from './screens/Screen5CroppingPattern';
import Screen6MarketInfo from './screens/Screen6MarketInfo';
import Screen7Recommendations from './screens/Screen7Recommendations';
import Screen8CropDetails from './screens/Screen8CropDetails';
import Screen9AskCopilot from './screens/Screen9AskCopilot';
import ScreenScenarioSimulator from './screens/ScreenScenarioSimulator';
import Screen11FarmPlan from './screens/Screen11FarmPlan';
import ScreenCropDisease from './screens/ScreenCropDisease';
import ScreenStateDashboard from './screens/ScreenStateDashboard';
import ScreenLogin from './screens/ScreenLogin';
import { subscribeAuthState, logoutUser } from './services/firebase';
import { mockData } from './services/mockData';

import {
  fetchGeocode,
  fetchLandAnalysis,
  fetchCroppingPattern,
  fetchMandiPrices,
  fetchRecommendations,
  fetchSoilIntelligence
} from './services/api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [appMode, setAppMode] = useState('DEMO'); // 'DEMO' | 'REAL'

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user) => {
      setCurrentUser(user);
      if (user) {
        setCurrentScreen((prev) => (prev === 'login' ? 1 : prev));
      } else {
        setCurrentScreen('login');
      }
    });
    return () => unsubscribe();
  }, []);
  const [farmData, setFarmData] = useState(mockData.farmLocation);
  const [landAnalysis, setLandAnalysis] = useState(mockData.landAnalysis);
  const [soilIntelligence, setSoilIntelligence] = useState(null);
  const [croppingPattern, setCroppingPattern] = useState(mockData.croppingPattern);
  const [marketInfo, setMarketInfo] = useState(mockData.marketInfo);
  const [recommendations, setRecommendations] = useState(mockData.recommendations);
  const [selectedCrop, setSelectedCrop] = useState(mockData.recommendations[0]);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [farmPlanContext, setFarmPlanContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with backend whenever coordinates, district, or appMode changes
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const isCustomCoord =
          Math.abs(farmData.coordinates.lat - 26.75) > 0.001 ||
          Math.abs(farmData.coordinates.lng - 83.37) > 0.001;
        const effectiveMode = isCustomCoord ? 'REAL' : appMode;

        const [geo, la, si] = await Promise.all([
          fetchGeocode(farmData.coordinates.lat, farmData.coordinates.lng, effectiveMode),
          fetchLandAnalysis(farmData.coordinates.lat, farmData.coordinates.lng, effectiveMode),
          fetchSoilIntelligence(farmData.coordinates.lat, farmData.coordinates.lng, farmData.district, effectiveMode)
        ]);
        if (geo?.provenance) {
          setFarmData((prev) => ({
            ...prev,
            provenance: geo.provenance
          }));
        }
        if (la) setLandAnalysis(la);
        if (si) setSoilIntelligence(si);

        const tempMetric = la?.keyInsights?.find(k => k.id === 'temperature');
        const currentTemp = tempMetric ? tempMetric.numericValue : 27.4;

        const activePh = si?.parameters?.ph?.value ?? 6.7;
        const activeSoilType = si?.soil_type || 'Loamy';
        const isCardVerified = si?.source_type === 'uploaded_card';

        const [cp, mp, recs] = await Promise.all([
          fetchCroppingPattern(farmData.district, effectiveMode),
          fetchMandiPrices({ district: farmData.district, lat: farmData.coordinates.lat, lng: farmData.coordinates.lng, mode: effectiveMode }),
          fetchRecommendations({
            temperature: currentTemp,
            rainfall: 850,
            soilPh: activePh,
            soilType: activeSoilType,
            season: 'Kharif',
            region: farmData.district,
            soilN: si?.parameters?.n?.value,
            soilP: si?.parameters?.p?.value,
            soilK: si?.parameters?.k?.value,
            soilZn: si?.parameters?.zn?.value,
            soilS: si?.parameters?.s?.value,
            cardVerified: isCardVerified,
            mode: effectiveMode
          })
        ]);

        if (cp) setCroppingPattern(cp);
        if (mp) setMarketInfo(mp);
        if (recs && recs.length > 0) {
          setRecommendations(recs);
          setSelectedCrop(recs[0]);
        }
      } catch (e) {
        console.warn('Could not sync with backend API, using local datasets:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [appMode, farmData.coordinates.lat, farmData.coordinates.lng, farmData.district]);

  const handleSoilUpdate = async (newReport) => {
    setSoilIntelligence(newReport);
    if (!newReport) return;

    try {
      const activePh = newReport.parameters?.ph?.value ?? 6.7;
      const activeSoilType = newReport.soil_type || 'Loamy';
      const isCardVerified = newReport.source_type === 'uploaded_card';

      const tempMetric = landAnalysis?.keyInsights?.find(k => k.id === 'temperature');
      const currentTemp = tempMetric ? tempMetric.numericValue : 27.4;

      const recs = await fetchRecommendations({
        temperature: currentTemp,
        rainfall: 850,
        soilPh: activePh,
        soilType: activeSoilType,
        season: 'Kharif',
        region: farmData.district,
        soilN: newReport.parameters?.n?.value,
        soilP: newReport.parameters?.p?.value,
        soilK: newReport.parameters?.k?.value,
        soilZn: newReport.parameters?.zn?.value,
        soilS: newReport.parameters?.s?.value,
        cardVerified: isCardVerified,
        mode: appMode
      });

      if (recs && recs.length > 0) {
        setRecommendations(recs);
        setSelectedCrop(recs[0]);
      }
    } catch (e) {
      console.warn('Could not recalibrate recommendations after soil update:', e);
    }
  };


  const handleNavigate = (screenNumber, params = {}) => {
    if (params?.cropId) {
      const match = recommendations.find(r => r.id === params.cropId);
      if (match) setSelectedCrop(match);
    }
    if (params?.farmPlanContext) {
      setFarmPlanContext(params.farmPlanContext);
    }
    setCurrentScreen(screenNumber);
  };

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
  };

  return (
    <MobileFrame
      currentScreen={currentScreen}
      onNavigate={handleNavigate}
      appMode={appMode}
      setAppMode={setAppMode}
    >
      {currentScreen === 1 && (
        <Screen1Home
          onNavigate={handleNavigate}
          appMode={appMode}
          setAppMode={setAppMode}
          provenance={farmData.provenance}
        />
      )}

      {currentScreen === 2 && (
        <Screen2DetectLand
          onNavigate={handleNavigate}
          farmData={farmData}
          setFarmData={setFarmData}
          appMode={appMode}
        />
      )}

      {currentScreen === 3 && (
        <Screen3Analyzing
          onNavigate={handleNavigate}
          appMode={appMode}
        />
      )}

      {currentScreen === 4 && (
        <Screen4LandAnalysis
          onNavigate={handleNavigate}
          farmData={farmData}
          landAnalysis={landAnalysis}
          soilIntelligence={soilIntelligence}
          onSoilUpdate={handleSoilUpdate}
          appMode={appMode}
        />
      )}

      {currentScreen === 5 && (
        <Screen5CroppingPattern
          onNavigate={handleNavigate}
          croppingPattern={croppingPattern}
          appMode={appMode}
        />
      )}

      {currentScreen === 6 && (
        <Screen6MarketInfo
          onNavigate={handleNavigate}
          marketInfo={marketInfo}
          appMode={appMode}
        />
      )}

      {currentScreen === 7 && (
        <Screen7Recommendations
          onNavigate={handleNavigate}
          recommendations={recommendations}
          onSelectCrop={handleSelectCrop}
          appMode={appMode}
        />
      )}

      {currentScreen === 8 && (
        <Screen8CropDetails
          onNavigate={handleNavigate}
          selectedCrop={selectedCrop}
          soilIntelligence={soilIntelligence}
          appMode={appMode}
        />
      )}

      {currentScreen === 9 && (
        <Screen9AskCopilot
          onNavigate={handleNavigate}
          selectedCrop={selectedCrop}
          farmData={farmData}
          soilIntelligence={soilIntelligence}
          initialMessages={mockData.copilot.initialMessages}
          quickChips={mockData.copilot.quickChips}
          appMode={appMode}
          farmPlanContext={farmPlanContext}
        />
      )}

      {(currentScreen === 10 || currentScreen === 'simulator') && (
        <ScreenScenarioSimulator
          onNavigate={handleNavigate}
          farmData={farmData}
          soilIntelligence={soilIntelligence}
          landAnalysis={landAnalysis}
          appMode={appMode}
          initialCropA={selectedCrop?.id || 'rice'}
          initialCropB={selectedCrop?.id === 'maize' ? 'rice' : 'maize'}
        />
      )}

      {(currentScreen === 11 || currentScreen === 'farm-plan') && (
        <Screen11FarmPlan
          onNavigate={handleNavigate}
          farmData={farmData}
          soilIntelligence={soilIntelligence}
          landAnalysis={landAnalysis}
          diseaseResult={diseaseResult}
          selectedCropId={selectedCrop?.id || 'rice'}
          appMode={appMode}
        />
      )}

      {currentScreen === 'disease' && (
        <ScreenCropDisease
          onNavigate={handleNavigate}
          appMode={appMode}
          onDiseaseDetected={setDiseaseResult}
        />
      )}

      {currentScreen === 'dashboard' && (
        <ScreenStateDashboard
          onNavigate={handleNavigate}
          appMode={appMode}
        />
      )}

      {currentScreen === 'login' && (
        <ScreenLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentScreen(1);
          }}
        />
      )}
    </MobileFrame>
  );
}

