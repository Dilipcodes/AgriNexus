/**
 * AgriNexus / FarmAI - Mock Data Service
 * 
 * Strict Data Integrity & Provenance:
 * - Every data object contains a granular `provenance` block.
 * - Factors have INDEPENDENT status: 'demo', 'estimated', 'live', or 'verified'.
 * - No blanket 'real' claims.
 */

export const mockData = {
  // Screen 1 & 2: Land & Location
  farmLocation: {
    name: "Gorakhpur, Uttar Pradesh",
    village: "Pipraich Block",
    district: "Gorakhpur",
    state: "Uttar Pradesh",
    coordinates: {
      lat: 26.7500,
      lng: 83.3700,
      display: "26.7500, 83.3700"
    },
    area: {
      acres: 2.4,
      hectares: 0.97,
      display: "2.4 acres"
    },
    // Farm polygon corners roughly centered around coordinates
    boundaryPolygon: [
      [26.7515, 83.3685],
      [26.7520, 83.3715],
      [26.7490, 83.3725],
      [26.7482, 83.3692]
    ],
    provenance: {
      factor: "location",
      source: "Demonstration Farm Boundary (Gorakhpur Reference)",
      timestamp_or_period: "2026-09-19",
      geographic_scope: "Gorakhpur (26.7500, 83.3700)",
      status: "demo",
      methodology_note: "Reference farm coordinates and boundary polygon aligned with UI design specification."
    }
  },

  // Screen 4: Land Analysis Report
  landAnalysis: {
    reportDate: "19 Sep 2026",
    keyInsights: [
      {
        id: "temperature",
        label: "Temperature",
        value: "27.4°C",
        numericValue: 27.4,
        unit: "°C",
        icon: "Thermometer",
        provenance: {
          factor: "weather_temperature",
          source: "Gorakhpur Agro-Climatic Reference Normal",
          timestamp_or_period: "September Benchmark",
          geographic_scope: "Gorakhpur Agro-climatic Zone",
          status: "demo",
          methodology_note: "Seasonal benchmark temperature. In REAL mode, this queries Open-Meteo live meteorology."
        }
      },
      {
        id: "soil_moisture",
        label: "Soil Moisture",
        value: "62%",
        numericValue: 62,
        unit: "%",
        icon: "Droplets",
        provenance: {
          factor: "soil_moisture",
          source: "Satellite Surface Soil Moisture Estimate (SMAP benchmark)",
          timestamp_or_period: "September 2026",
          geographic_scope: "0-5cm Root-Zone Soil Profile",
          status: "estimated",
          methodology_note: "Derived from satellite microwave surface moisture products; not an in-situ probe measurement."
        }
      },
      {
        id: "rainfall",
        label: "Annual Rainfall",
        value: "850 mm",
        numericValue: 850,
        unit: "mm",
        icon: "CloudRain",
        provenance: {
          factor: "weather_rainfall",
          source: "IMD Long-Period Average (Gorakhpur District)",
          timestamp_or_period: "Annual Normal Series",
          geographic_scope: "Gorakhpur District",
          status: "estimated",
          methodology_note: "Long-period historical annual normal precipitation."
        }
      },
      {
        id: "ndvi",
        label: "NDVI",
        value: "0.64",
        numericValue: 0.64,
        unit: "Index (0-1)",
        icon: "Leaf",
        provenance: {
          factor: "satellite_ndvi",
          source: "Sentinel-2 Surface Reflectance (Vegetation Index)",
          timestamp_or_period: "Post-Monsoon Kharif Window",
          geographic_scope: "Field Boundary",
          status: "estimated",
          methodology_note: "Satellite-derived normalized difference vegetation index representing canopy vigor."
        }
      }
    ],
    secondaryMetrics: [
      {
        label: "Elevation",
        value: "87 m",
        provenance: {
          factor: "terrain_elevation",
          source: "SRTM / Digital Elevation Model",
          status: "estimated",
          methodology_note: "Regional DEM height above mean sea level."
        }
      },
      {
        label: "Slope",
        value: "2.1°",
        provenance: {
          factor: "terrain_slope",
          source: "DEM Topographic Gradient",
          status: "estimated",
          methodology_note: "Gentle alluvial plain gradient suitable for irrigated agriculture."
        }
      },
      {
        label: "Land Cover",
        value: "Agricultural Land",
        provenance: {
          factor: "land_cover",
          source: "ESA WorldCover Classification",
          status: "estimated",
          methodology_note: "Satellite land use / land cover classification."
        }
      },
      {
        label: "Soil pH",
        value: "6.7",
        provenance: {
          factor: "soil_ph",
          source: "Regional Soil Health Database (ICAR/Alluvial benchmark)",
          status: "estimated",
          methodology_note: "Estimated neutral-range alluvial soil pH. Official Soil Health Card required for exact field values."
        }
      },
      {
        label: "Soil Type",
        value: "Loamy",
        provenance: {
          factor: "soil_texture",
          source: "Regional Soil Classification (Indo-Gangetic Plain)",
          status: "estimated",
          methodology_note: "Dominant soil texture class in eastern UP alluvial basin."
        }
      }
    ]
  },

  // Screen 5: Local Cropping Pattern
  croppingPattern: {
    timeframe: "Based on 5 years of data (2019 - 2024)",
    crops: [
      { name: "Rice", percentage: 43, color: "#16a34a", icon: "🌾", bg: "bg-emerald-500" },
      { name: "Wheat", percentage: 31, color: "#d97706", icon: "🌾", bg: "bg-amber-600" },
      { name: "Maize", percentage: 17, color: "#eab308", icon: "🌽", bg: "bg-yellow-500" },
      { name: "Pulses", percentage: 6, color: "#92400e", icon: "🫘", bg: "bg-amber-800" },
      { name: "Other", percentage: 3, color: "#64748b", icon: "🌱", bg: "bg-slate-500" }
    ],
    history: {
      previousSeasonCrop: "Wheat",
      currentlyDetectedCrop: "Rice (Satellite-based estimate)",
      commonRotation: "Rice ➔ Wheat"
    },
    note: "Note: This is based on satellite analysis and government data. Actual crops may vary.",
    provenance: {
      factor: "cropping_pattern",
      source: "Hackathon Reference Template (DES/data.gov.in format)",
      timestamp_or_period: "2019 - 2024 (Illustrative)",
      geographic_scope: "Gorakhpur Agro-climatic District",
      status: "demo",
      methodology_note: "Illustrative crop distribution matching UI reference specification. Not a verified district census record."
    }
  },

  // Screen 6: Market Information (AGMARKNET reference)
  marketInfo: {
    mandiName: "Gorakhpur Mandi",
    distance: "18 km",
    table: [
      { crop: "Rice", min: "2,300", max: "2,650", modal: "2,500", icon: "🌾" },
      { crop: "Wheat", min: "2,350", max: "2,700", modal: "2,550", icon: "🌾" },
      { crop: "Maize", min: "2,000", max: "2,400", modal: "2,200", icon: "🌽" },
      { crop: "Arhar", min: "6,500", max: "7,200", modal: "6,900", icon: "🫘" },
      { crop: "Mustard", min: "5,400", max: "6,100", modal: "5,750", icon: "🌱" }
    ],
    disclaimer: "Prices are latest reported mandi rates from AGMARKNET. Actual selling price may vary based on quality and market conditions.",
    provenance: {
      factor: "mandi_rates",
      source: "AGMARKNET Reference Bulletin (Reported APMC rates)",
      timestamp_or_period: "September 2026 Reference",
      geographic_scope: "Gorakhpur Mandi (APMC)",
      status: "demo",
      methodology_note: "Reported APMC market rates used for economic decision support; not a guaranteed farmgate price."
    }
  },

  // Screen 7 & 8: Crop Recommendations & Detail
  recommendations: [
    {
      id: "rice",
      rank: "#1",
      name: "Rice",
      suitability: "High Suitability",
      badgeType: "high", // 'high' | 'moderate'
      icon: "🌾",
      image: "/rice.jpg",
      summaryReasons: [
        "Suitable temperature and rainfall",
        "Good soil conditions",
        "Commonly grown in your area",
        "Good market price"
      ],
      detailedReasons: [
        "Suitable temperature (25°C – 32°C)",
        "Adequate rainfall (800 – 1200 mm)",
        "Good soil pH (6.0 – 7.5)",
        "Suitable moisture conditions",
        "Commonly grown in your area",
        "Good market price"
      ],
      idealSeason: "Kharif (June – October)",
      growingGuide: {
        soilRequirement: "Clayey loam to loamy soil with good water retention.",
        sowingTime: "Nursery: May–June; Transplanting: June–July.",
        irrigationNeeds: "Standing water 2-5 cm during vegetative and reproductive stages."
      },
      // Screen 9 / Fertilizer Guidance - Explicit agronomic assumptions
      fertilizerGuidance: {
        recommendation: {
          urea: "100–120 kg/ha",
          dap: "50–60 kg/ha",
          mop: "40–50 kg/ha"
        },
        assumptions: "General package of practices for semi-dwarf high-yielding rice in medium-fertility alluvial plains.",
        disclaimer: "Please adjust based on local agricultural department (KVK) / official Soil Health Card advice.",
        provenance: {
          factor: "fertilizer_guideline",
          source: "ICAR-NRRI Agronomy Package of Practices (Medium Soil Fertility Benchmark)",
          timestamp_or_period: "Agronomy Reference Edition",
          geographic_scope: "Indo-Gangetic Alluvial Zone",
          status: "estimated",
          methodology_note: "Nutrient guidance calculated from ICAR general fertility tables for medium fertility soils. Not field-tested on this specific parcel."
        }
      },
      provenance: {
        factor: "crop_recommendation",
        source: "ICAR Biophysical Suitability Matrix (Deterministic Agronomic Rule Match)",
        timestamp_or_period: "Kharif 2026 Evaluation",
        geographic_scope: "Gorakhpur Soil & Climate Profile",
        status: "estimated",
        methodology_note: "Qualitative suitability rating based on temperature, rainfall, pH, and historical cropping alignment."
      }
    },
    {
      id: "maize",
      rank: "#2",
      name: "Maize",
      suitability: "Moderate Suitability",
      badgeType: "moderate",
      icon: "🌽",
      summaryReasons: [
        "Suitable for your soil and climate",
        "Good market demand",
        "Alternative crop option"
      ],
      detailedReasons: [
        "Optimal temperature (21°C – 30°C)",
        "Moderate rainfall requirement (500 – 800 mm)",
        "Well-drained loamy soil required (avoid waterlogging)",
        "High industrial & feed demand in regional markets"
      ],
      idealSeason: "Kharif / Spring",
      provenance: {
        factor: "crop_recommendation",
        source: "ICAR Biophysical Suitability Matrix",
        status: "estimated",
        methodology_note: "Rated Moderate due to sensitivity to excess moisture/waterlogging in heavy alluvial soils."
      }
    },
    {
      id: "wheat",
      rank: "#3",
      name: "Wheat",
      suitability: "Moderate Suitability",
      badgeType: "moderate",
      icon: "🌾",
      summaryReasons: [
        "Suitable for Rabi season",
        "Commonly grown in your area",
        "Stable market price"
      ],
      detailedReasons: [
        "Requires cooler temperature (12°C – 25°C)",
        "Excellent rotational fit following Kharif rice",
        "High regional MSP and mandi stability"
      ],
      idealSeason: "Rabi (November – April)",
      provenance: {
        factor: "crop_recommendation",
        source: "ICAR Biophysical Suitability Matrix",
        status: "estimated",
        methodology_note: "Rated Moderate for current Kharif planting window; optimal for upcoming Rabi season."
      }
    }
  ],

  // Screen 9: FarmAI Assistant Default Chat & Suggestion Chips
  copilot: {
    initialMessages: [
      {
        id: "msg-1",
        sender: "user",
        text: "How much fertilizer is required for rice in this soil?"
      },
      {
        id: "msg-2",
        sender: "bot",
        text: "For rice in your soil conditions, a general recommendation is:\n\n• Urea (Nitrogen): 100–120 kg/ha\n• DAP (Phosphorus): 50–60 kg/ha\n• MOP (Potassium): 40–50 kg/ha\n\nPlease adjust based on local agricultural department advice.",
        provenance: {
          factor: "copilot_advice",
          source: "ICAR Agronomy Fertilizer Benchmark (Demo Local Engine)",
          timestamp_or_period: "2026-09-19",
          geographic_scope: "Gorakhpur Loamy Soil",
          status: "demo",
          methodology_note: "Demo assistant response grounded in ICAR medium-fertility guidelines. In REAL mode with GEMINI_MODEL, queries Gemini with active farm context."
        }
      }
    ],
    quickChips: [
      "How to control pests?",
      "Best variety for my area",
      "Expected yield",
      "Irrigation tips"
    ]
  }
};
