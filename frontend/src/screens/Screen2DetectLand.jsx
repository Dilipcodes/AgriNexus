import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Search, MapPin, Crosshair, Layers, Maximize2, Move, ArrowRight, Plus, Minus } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { fetchGeocode } from '../services/api';

// Custom draggable vertex icon for adjusting polygon corners
const cornerIcon = L.divIcon({
  className: 'custom-corner-handle',
  html: `<div style="width:16px;height:16px;background:#10b981;border:2.5px solid #ffffff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,0.45);cursor:grab;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Compute approximate area in acres from lat/lng polygon coordinates
function computePolygonAcres(coords) {
  if (!coords || coords.length < 3) return 2.4;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const meanLat = toRad(coords.reduce((s, c) => s + c[0], 0) / coords.length);
  const metersPerDegLat = 111132.92;
  const metersPerDegLng = 111412.84 * Math.cos(meanLat);

  let areaSqMeters = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const x1 = coords[i][1] * metersPerDegLng;
    const y1 = coords[i][0] * metersPerDegLat;
    const x2 = coords[j][1] * metersPerDegLng;
    const y2 = coords[j][0] * metersPerDegLat;
    areaSqMeters += x1 * y2 - x2 * y1;
  }
  areaSqMeters = Math.abs(areaSqMeters) / 2.0;
  const acres = areaSqMeters / 4046.8564224;
  return Math.max(0.2, Number(acres.toFixed(1)));
}

// Generate or scale polygon around center to match target acres
function scalePolygonForAcres(coords, centerLat, centerLng, targetAcres) {
  const currentAcres = computePolygonAcres(coords);
  if (!coords || coords.length < 3 || currentAcres <= 0.05) {
    // Build a rectangular parcel centered on (centerLat, centerLng)
    const areaSqMeters = targetAcres * 4046.8564224;
    const halfSideMeters = Math.sqrt(areaSqMeters) / 2;
    const dLat = halfSideMeters / 111132.92;
    const dLng = halfSideMeters / (111412.84 * Math.cos((centerLat * Math.PI) / 180));
    return [
      [Number((centerLat + dLat).toFixed(5)), Number((centerLng - dLng).toFixed(5))],
      [Number((centerLat + dLat).toFixed(5)), Number((centerLng + dLng).toFixed(5))],
      [Number((centerLat - dLat).toFixed(5)), Number((centerLng + dLng).toFixed(5))],
      [Number((centerLat - dLat).toFixed(5)), Number((centerLng - dLng).toFixed(5))]
    ];
  }

  const scaleFactor = Math.sqrt(targetAcres / currentAcres);
  const cLat = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const cLng = coords.reduce((s, c) => s + c[1], 0) / coords.length;

  return coords.map(([pLat, pLng]) => [
    Number((cLat + (pLat - cLat) * scaleFactor).toFixed(5)),
    Number((cLng + (pLng - cLng) * scaleFactor).toFixed(5))
  ]);
}

// Helper component to recenter map when coordinates change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 16);
  }, [center[0], center[1], map]);
  return null;
}

// Map click event listener to select parcel centroid
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function Screen2DetectLand({ onNavigate, farmData, setFarmData, appMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [polygonCoords, setPolygonCoords] = useState(farmData.boundaryPolygon);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'street'
  const searchInputRef = useRef(null);

  const center = [farmData.coordinates.lat, farmData.coordinates.lng];
  const currentAcres = farmData.area?.acres ?? 2.4;

  // Update polygon coords if farmData changes externally
  useEffect(() => {
    setPolygonCoords(farmData.boundaryPolygon);
  }, [farmData.boundaryPolygon]);

  // Update land size (acres) and scale polygon visually on the map
  const handleAreaChange = (newAcresRaw) => {
    const clampedAcres = Math.min(50, Math.max(0.2, Number(Number(newAcresRaw).toFixed(1))));
    const hectares = Number((clampedAcres * 0.404686).toFixed(2));
    const updatedPolygon = scalePolygonForAcres(
      polygonCoords,
      farmData.coordinates.lat,
      farmData.coordinates.lng,
      clampedAcres
    );

    setPolygonCoords(updatedPolygon);
    setFarmData((prev) => ({
      ...prev,
      totalArea: hectares,
      area: {
        acres: clampedAcres,
        hectares,
        display: `${clampedAcres} acres`
      },
      boundaryPolygon: updatedPolygon
    }));
  };

  // Handle dragging an individual polygon vertex in Adjust Mode
  const handleCornerDrag = (index, newLat, newLng) => {
    const updated = polygonCoords.map((pt, idx) =>
      idx === index ? [Number(newLat.toFixed(5)), Number(newLng.toFixed(5))] : pt
    );
    const recalculatedAcres = computePolygonAcres(updated);
    const hectares = Number((recalculatedAcres * 0.404686).toFixed(2));

    setPolygonCoords(updated);
    setFarmData((prev) => ({
      ...prev,
      totalArea: hectares,
      area: {
        acres: recalculatedAcres,
        hectares,
        display: `${recalculatedAcres} acres`
      },
      boundaryPolygon: updated
    }));
  };

  // Handle location selection from map click, search or GPS
  const handleLocationSelect = async (newLat, newLng) => {
    const dLat = newLat - farmData.coordinates.lat;
    const dLng = newLng - farmData.coordinates.lng;
    const updatedPolygon = polygonCoords.map(([pLat, pLng]) => [
      Number((pLat + dLat).toFixed(5)),
      Number((pLng + dLng).toFixed(5))
    ]);
    setPolygonCoords(updatedPolygon);

    // Optimistically update coordinates immediately so UI feels snappy
    setFarmData((prev) => ({
      ...prev,
      coordinates: {
        lat: Number(newLat.toFixed(4)),
        lng: Number(newLng.toFixed(4)),
        display: `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`
      },
      boundaryPolygon: updatedPolygon
    }));

    // Call backend geocoding service (pass REAL if user actively moved away from default benchmark)
    const isDefaultCoord = Math.abs(newLat - 26.75) < 0.001 && Math.abs(newLng - 83.37) < 0.001;
    const effectiveMode = isDefaultCoord ? appMode : 'REAL';
    const geo = await fetchGeocode(newLat, newLng, effectiveMode);

    setFarmData((prev) => ({
      ...prev,
      name: geo.name || prev.name,
      village: geo.village || prev.village,
      district: geo.district || prev.district,
      state: geo.state || prev.state,
      coordinates: {
        lat: Number(newLat.toFixed(4)),
        lng: Number(newLng.toFixed(4)),
        display: `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`
      },
      boundaryPolygon: updatedPolygon,
      provenance: geo.provenance || prev.provenance
    }));
  };

  const handleSearchSubmit = async () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const PRESET_COORDS = {
      gorakhpur: [26.7500, 83.3700],
      lucknow: [26.8467, 80.9462],
      varanasi: [25.3176, 82.9739],
      kushinagar: [26.7410, 83.8890],
      basti: [26.7997, 82.7634],
      deoria: [26.5042, 83.7797],
      ayodhya: [26.7922, 82.1998],
      kanpur: [26.4499, 80.3319]
    };

    if (PRESET_COORDS[q]) {
      const [sLat, sLng] = PRESET_COORDS[q];
      await handleLocationSelect(sLat, sLng);
      setSearchQuery('');
      return;
    }

    // Try parsing direct lat, lng string (e.g. "26.85, 80.94")
    const parts = q.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      await handleLocationSelect(parts[0], parts[1]);
      setSearchQuery('');
      return;
    }

    // Live forward geocoding via OpenStreetMap Nominatim
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const sLat = parseFloat(results[0].lat);
          const sLng = parseFloat(results[0].lon);
          await handleLocationSelect(sLat, sLng);
          setSearchQuery('');
          return;
        }
      }
    } catch (err) {
      console.warn('Nominatim search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle boundary adjustment mode
  const handleAdjustToggle = () => {
    setIsAdjusting(!isAdjusting);
  };

  return (
    <div className="flex flex-col min-h-full bg-white text-slate-800 relative">
      {/* Top Header */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => onNavigate(1)}
          className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-sm text-slate-900 tracking-tight">Select Your Farm</h2>
        <div className="w-5" />
      </div>

      {/* Location Search Bar */}
      <div className="px-4 py-2 bg-white z-20 border-b border-slate-100">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search village, district, or lat,lng..."
            className="w-full text-xs bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
          />
          {searchQuery.trim() && (
            <button
              onClick={handleSearchSubmit}
              disabled={isSearching}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shrink-0"
            >
              {isSearching ? '...' : 'Go'}
            </button>
          )}
        </div>
      </div>

      {/* Map View Area */}
      <div className="relative bg-slate-200 h-[270px] sm:h-[300px] shrink-0">
        <MapContainer
          center={center}
          zoom={16}
          zoomControl={false}
          className="w-full h-full"
        >
          <ChangeView center={center} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {mapType === 'satellite' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Farm Parcel Polygon */}
          <Polygon
            positions={polygonCoords}
            pathOptions={{
              color: '#22c55e',
              weight: 3,
              fillColor: '#16a34a',
              fillOpacity: 0.35,
              dashArray: isAdjusting ? '6, 6' : undefined
            }}
          />

          {/* Draggable Corner Handles when Adjusting Boundary */}
          {isAdjusting &&
            polygonCoords.map((pos, idx) => (
              <Marker
                key={idx}
                position={pos}
                icon={cornerIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const latlng = e.target.getLatLng();
                    handleCornerDrag(idx, latlng.lat, latlng.lng);
                  }
                }}
              />
            ))}
        </MapContainer>

        {/* Acreage Tag Overlay inside Polygon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-md border border-emerald-500 text-[11px] font-bold text-slate-800 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {farmData.area.display}
          </div>
        </div>

        {/* Floating Map Controls (Right edge) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            onClick={() => setMapType(mapType === 'satellite' ? 'street' : 'satellite')}
            className="w-8 h-8 rounded-lg bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:text-emerald-700 transition-colors border border-slate-200 cursor-pointer"
            title="Toggle Map Style"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => handleLocationSelect(pos.coords.latitude, pos.coords.longitude),
                  () => handleLocationSelect(26.7500, 83.3700)
                );
              } else {
                handleLocationSelect(26.7500, 83.3700);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:text-emerald-700 transition-colors border border-slate-200 cursor-pointer"
            title="Detect GPS Location"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdjustToggle}
            className={`w-8 h-8 rounded-lg shadow-md flex items-center justify-center transition-colors border cursor-pointer ${
              isAdjusting
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-white/95 text-slate-700 hover:text-emerald-700 border-slate-200'
            }`}
            title="Adjust Boundary & Size"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Adjusting Banner Notification */}
        {isAdjusting && (
          <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-md z-20 flex items-center gap-1">
            <Move className="w-3 h-3" />
            <span>Drag green corners or use slider below</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet / Farm Details Card */}
      <div className="bg-white rounded-t-2xl shadow-xl p-4 border-t border-slate-100 z-20 space-y-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mt-0.5 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">Location Detected</span>
                <ProvenanceBadge provenance={farmData.provenance} />
              </div>
              <p className="text-xs text-slate-600 font-medium">{farmData.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAdjusting(true);
              searchInputRef.current?.focus();
            }}
            className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
          >
            Change Location
          </button>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-600 font-semibold block uppercase">Area</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-800 text-sm">{farmData.area.display}</span>
              <span className="text-[10px] text-slate-500">({farmData.area.hectares ?? (currentAcres * 0.404686).toFixed(2)} ha)</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-600 font-semibold block uppercase">Coordinates</span>
            <span className="font-semibold text-slate-700 text-[11px]">{farmData.coordinates.display}</span>
          </div>
        </div>

        {/* Interactive Land Area Size Adjuster */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950">Adjust Land Size (Acres)</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAreaChange(currentAcres - 0.5)}
                className="w-6 h-6 rounded-md bg-white border border-emerald-300 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                title="Decrease by 0.5 acres"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="0.2"
                max="50"
                step="0.1"
                value={currentAcres}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) handleAreaChange(val);
                }}
                className="w-14 text-center text-xs font-bold text-slate-900 bg-white border border-emerald-300 rounded-md py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => handleAreaChange(currentAcres + 0.5)}
                className="w-6 h-6 rounded-md bg-white border border-emerald-300 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                title="Increase by 0.5 acres"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <input
            type="range"
            min="0.5"
            max="20"
            step="0.1"
            value={Math.min(20, currentAcres)}
            onChange={(e) => handleAreaChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-emerald-200 rounded-lg"
          />

          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {[1.0, 2.4, 5.0, 10.0].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAreaChange(preset)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  Math.abs(currentAcres - preset) < 0.05
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                }`}
              >
                {preset} ac
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Row */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleAdjustToggle}
            className={`w-full py-2 px-3 border text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isAdjusting
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <Move className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAdjusting ? 'Finish Adjusting Corners' : 'Adjust Boundary Corners'}</span>
          </button>

          <button
            onClick={() => onNavigate(3)}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Analyze This Land</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
