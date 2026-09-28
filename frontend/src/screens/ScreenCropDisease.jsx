import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Upload, Camera, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, ArrowRight, Info, Leaf, Activity, X } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { analyzeCropDisease } from '../services/diseaseService';
import { saveDiseaseScanToFirestore } from '../services/firestore';

export default function ScreenCropDisease({ onNavigate, appMode = 'DEMO', onDiseaseDetected = null }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop active camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Start live camera stream or fallback to mobile camera input
  const handleStartCamera = async () => {
    setUploadError(null);
    setAnalysisResult(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = stream;
        setIsCameraOpen(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }, 50);
        return;
      } catch (err) {
        console.warn('Webcam stream unavailable, falling back to camera file input:', err);
      }
    }
    cameraInputRef.current?.click();
  };

  // Capture frame from live camera video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setImagePreview(dataUrl);
    setAnalysisResult(null);
    stopCamera();
  };

  // Handle custom image upload from device with 5MB cap & MIME validation
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setUploadError('Unsupported file format. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError(`Image exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller photo.`);
      return;
    }

    setUploadError(null);
    stopCamera();
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Run disease diagnostic analysis
  const handleAnalyze = async () => {
    if (!imagePreview) {
      setUploadError('Please click or upload a leaf image first.');
      return;
    }
    stopCamera();
    setIsAnalyzing(true);
    setUploadError(null);

    const result = await analyzeCropDisease(
      imagePreview,
      'Crop',
      null,
      'REAL'
    );

    setAnalysisResult(result);
    if (onDiseaseDetected) {
      onDiseaseDetected(result);
    }

    // Save scan result to Firestore database
    try {
      const storedUser = localStorage.getItem('agrinexus_user');
      const userId = storedUser ? JSON.parse(storedUser).uid : 'demo_farmer';
      await saveDiseaseScanToFirestore(userId, {
        crop_type: result.crop || 'Crop',
        disease_detected: result.diseaseName,
        confidence: result.confidenceScore ? result.confidenceScore / 100 : 0.9,
        organic_remedy: result.immediateActions?.[0] || '',
        chemical_remedy: result.immediateActions?.[2] || result.immediateActions?.[1] || ''
      });
    } catch (e) {
      console.warn('Could not persist disease scan to Firestore:', e);
    }

    setIsAnalyzing(false);
  };

  // Reset to scan another image
  const handleReset = () => {
    stopCamera();
    setImagePreview(null);
    setAnalysisResult(null);
    setUploadError(null);
    setIsAnalyzing(false);
  };

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
            <Leaf className="w-3 h-3" />
          </div>
          <h2 className="font-bold text-sm text-slate-900 tracking-tight">Crop Disease Detection</h2>
        </div>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-center">
        {/* State 1: Only Click Image, Upload Image & Analyze Disease */}
        {!analysisResult && (
          <div className="space-y-4">
            {/* Hidden File Inputs */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Main Image / Live Camera Viewport */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-300 bg-white shadow-xs flex items-center justify-center">
              {isCameraOpen ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 border-2 border-white cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                </>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected leaf preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm">Click or Upload a Leaf Image</span>
                  <span className="text-[11px] text-slate-400">Take a clear photo of the affected crop leaf to analyze disease</span>
                </div>
              )}

              {/* Animated Scanning Beam Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-2xs flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-emerald-400 shadow-lg shadow-emerald-400/80 animate-pulse absolute top-1/3" />
                  <div className="p-3 bg-white/95 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    Analyzing leaf image...
                  </div>
                </div>
              )}
            </div>

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-left flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-800 leading-snug font-medium">
                  {uploadError}
                </p>
              </div>
            )}

            {/* Click Image & Upload Image Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={isCameraOpen ? stopCamera : handleStartCamera}
                className={`py-3 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  isCameraOpen
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {isCameraOpen ? (
                  <>
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Close Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Click Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Image</span>
              </button>
            </div>

            {/* Analyze Disease Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imagePreview || isCameraOpen}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Image...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Analyze Disease</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* State 2: Diagnostic Results Screen */}
        {analysisResult && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2">
            {/* Non-Plant Subject Notice if isPlant is false */}
            {!analysisResult.isPlant && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-left flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 leading-tight">
                    Non-Plant Subject Detected
                  </h4>
                  <p className="text-[11px] text-amber-800 leading-snug mt-1">
                    The vision model did not detect a recognized crop leaf in this photo. Screening results below are simulated guidance; please upload a clear, focused leaf image.
                  </p>
                </div>
              </div>
            )}

            {/* Top Detected Disease Banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-left space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Diagnostic Result
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {analysisResult.diseaseName}
                  </h3>
                  <p className="text-[11px] italic font-serif text-slate-500">
                    {analysisResult.scientificName}
                  </p>
                </div>
                <ProvenanceBadge provenance={analysisResult.provenance} />
              </div>

              {/* Confidence & Severity Badges */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  {analysisResult.confidenceDisplay}
                </span>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    analysisResult.severityColor === 'red'
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : analysisResult.severityColor === 'amber'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Severity: {analysisResult.severity}
                </span>
              </div>
            </div>

            {/* Identified Symptoms Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-2">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Observed Symptoms</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysisResult.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Actions */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-2">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recommended Immediate Actions</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysisResult.immediateActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-[11px] leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Long-term Prevention Guide */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs text-left space-y-2">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>Prevention & Management</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysisResult.preventionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="text-[11px]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mandatory Agricultural Advisory Disclaimer */}
            <div className="bg-slate-100/90 rounded-xl p-3 border border-slate-200 text-left flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-600 leading-relaxed">
                <strong>Agricultural Advisory Notice:</strong> This digital tool provides visual disease screening assistance based on ICAR symptom references. Always consult your local Krishi Vigyan Kendra (KVK) or extension officer for certified chemical treatment validation.
              </p>
            </div>

            {/* Action to incorporate into Farm Plan */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => onNavigate(11)}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Incorporate into Personalized Farm Plan (Screen 11)</span>
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Scan Another Image</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
