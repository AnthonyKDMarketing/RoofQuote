'use client';

import { useEffect, useState } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { ArrowRight, ArrowLeft, Loader2, AlertTriangle, CheckCircle, Home, RefreshCw } from 'lucide-react';
import type { ProcessedRoofData } from '@/lib/solar';

interface Step2Props {
  accentColor: string;
  primaryColor: string;
}

const COMPLEXITY_LABELS = {
  simple: { label: 'Simple', color: '#22c55e', desc: 'Gable roof, 1–2 planes' },
  moderate: { label: 'Moderate', color: '#f59e0b', desc: 'Hip roof, 3–5 planes' },
  complex: { label: 'Complex', color: '#ef4444', desc: '6+ planes, dormers, valleys' },
};

const QUALITY_LABELS: Record<string, string> = {
  HIGH: '~98% accuracy',
  MEDIUM: '~95% accuracy',
  LOW: '~90% accuracy',
};

export default function Step2RoofAnalysis({ accentColor, primaryColor }: Step2Props) {
  const { lat, lng, address, setRoofData, setManualMeasurement, nextStep, prevStep, setStep } = useQuoteStore();
  const [status, setStatus] = useState<'loading' | 'found' | 'manual' | 'error'>('loading');
  const [roofData, setLocalRoofData] = useState<ProcessedRoofData | null>(null);

  // Manual fallback state
  const [manualHomeSqFt, setManualHomeSqFt] = useState('');
  const [manualRoofType, setManualRoofType] = useState<'gable' | 'hip' | 'flat' | 'complex'>('gable');
  const [manualStories, setManualStories] = useState('1');
  const [manualError, setManualError] = useState('');

  useEffect(() => {
    async function fetchRoofData() {
      if (!lat || !lng) { setStatus('manual'); return; }

      try {
        const res = await fetch('/api/roof/measure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (!data.found) {
          setStatus('manual');
          return;
        }

        setLocalRoofData(data.data);
        setStatus('found');
      } catch {
        setStatus('error');
      }
    }

    fetchRoofData();
  }, [lat, lng]);

  const handleConfirm = () => {
    if (!roofData) return;
    setRoofData(roofData);
    nextStep();
  };

  const handleManualSubmit = () => {
    const sqFt = parseFloat(manualHomeSqFt);
    if (!sqFt || sqFt < 200 || sqFt > 20000) {
      setManualError('Please enter a valid home size (200–20,000 sq ft)');
      return;
    }

    const stories = parseInt(manualStories) || 1;
    const pitchMultipliers: Record<string, number> = { flat: 1.05, gable: 1.15, hip: 1.25, complex: 1.40 };
    const multiplier = pitchMultipliers[manualRoofType];
    const footprintSqFt = sqFt / stories;
    const roofAreaSqFt = footprintSqFt * multiplier * 1.05;
    const baseSquares = roofAreaSqFt / 100;

    const complexityMap: Record<string, 'simple' | 'moderate' | 'complex'> = {
      flat: 'simple', gable: 'simple', hip: 'moderate', complex: 'complex',
    };
    const complexity = complexityMap[manualRoofType];
    const wasteFactors = { simple: 0.10, moderate: 0.15, complex: 0.20 };
    const wasteFactor = wasteFactors[complexity];
    const estimatedSquares = Math.round(baseSquares * (1 + wasteFactor) * 10) / 10;

    setManualMeasurement({
      homeSqFt: sqFt,
      roofType: manualRoofType,
      stories,
      estimatedSquares,
      complexity,
    });
    nextStep();
  };

  if (status === 'loading') {
    return (
      <div className="animate-slide-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Scanning Your Roof</h2>
          <p className="text-slate-500">Retrieving aerial measurements for your property...</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-10 text-center">
          <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${accentColor}15` }}>
              <Loader2 size={36} className="animate-spin" style={{ color: accentColor }} />
            </div>
          </div>
          <p className="text-slate-600 font-medium mb-2">Analyzing aerial imagery</p>
          <p className="text-slate-400 text-sm">{address}</p>
          <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
            {['Locating property...', 'Processing roof segments...', 'Calculating measurements...'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${accentColor}44`, borderTopColor: accentColor, animationDelay: `${i * 0.2}s` }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'found' && roofData) {
    const complexityInfo = COMPLEXITY_LABELS[roofData.complexity];
    return (
      <div className="animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ background: '#22c55e18', color: '#16a34a' }}>
            <CheckCircle size={14} />
            Roof Successfully Measured
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Your Roof Profile</h2>
          <p className="text-slate-500 text-sm">{address}</p>
        </div>

        {/* Satellite map placeholder with overlay */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
          <div
            className="relative h-56 md:h-72 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor}22 0%, ${accentColor}22 100%)` }}
          >
            {/* Google Static Map */}
            {lat && lng && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=19&size=700x300&maptype=satellite&markers=color:${encodeURIComponent(accentColor)}|${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt="Satellite view of property"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {/* Measurement overlay */}
            <div className="relative z-10 glass rounded-xl px-5 py-3 text-center shadow-lg">
              <p className="text-2xl font-black text-slate-900">{roofData.squaresWithWaste.toFixed(1)}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roofing Squares</p>
            </div>
          </div>

          {/* Measurements grid */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Roof Area', value: `${roofData.totalAreaSqFt.toLocaleString()} sq ft`, icon: '📐' },
              { label: 'Pitch', value: roofData.avgPitchRatio, icon: '📏' },
              { label: 'Roof Planes', value: roofData.segmentCount.toString(), icon: '🔷' },
              { label: 'Accuracy', value: QUALITY_LABELS[roofData.imageryQuality] || '~95%', icon: '🎯' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-bold text-slate-900 text-sm">{item.value}</div>
                <div className="text-xs text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Complexity badge */}
          <div className="px-6 pb-6">
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: `${complexityInfo.color}12` }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: complexityInfo.color }} />
                <span className="text-sm font-bold" style={{ color: complexityInfo.color }}>
                  {complexityInfo.label} Roof
                </span>
                <span className="text-xs text-slate-500">{complexityInfo.desc}</span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                +{(roofData.wasteFactor * 100).toFixed(0)}% waste factor applied
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={() => setStatus('manual')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={16} /> Adjust
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: accentColor }}
          >
            Confirm & Continue <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-3">
          Measurements derived from Google aerial imagery. Final measurements verified on-site.
        </p>
      </div>
    );
  }

  // Manual fallback (status === 'manual' || 'error')
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        {status === 'error' ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-amber-50 text-amber-700">
            <AlertTriangle size={14} />
            Aerial data unavailable for this address
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-blue-50 text-blue-700">
            <Home size={14} />
            Enter your home details
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
          {status === 'error' ? 'Let\'s Estimate Manually' : 'Tell Us About Your Home'}
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We&apos;ll use your home&apos;s size and roof type to estimate your roofing area. You&apos;ll still receive a detailed estimate.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-6">
        <div className="space-y-5">
          {/* Home sq ft */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Home Size (Square Feet)
            </label>
            <input
              type="number"
              value={manualHomeSqFt}
              onChange={(e) => { setManualHomeSqFt(e.target.value); setManualError(''); }}
              placeholder="e.g. 2400"
              min="200"
              max="20000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-base focus:outline-none focus:ring-2 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">Total living area, including all floors</p>
          </div>

          {/* Stories */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Number of Stories</label>
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3+'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setManualStories(s === '3+' ? '3' : s)}
                  className="py-3 rounded-xl border-2 font-bold text-sm transition-all"
                  style={{
                    borderColor: manualStories === (s === '3+' ? '3' : s) ? accentColor : '#e2e8f0',
                    background: manualStories === (s === '3+' ? '3' : s) ? `${accentColor}12` : 'white',
                    color: manualStories === (s === '3+' ? '3' : s) ? accentColor : '#64748b',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Roof type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Roof Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'gable', label: 'Gable', icon: '🏠', desc: 'Simple triangle shape' },
                { value: 'hip', label: 'Hip', icon: '🏡', desc: 'Slopes on all sides' },
                { value: 'flat', label: 'Flat / Low-Slope', icon: '🏢', desc: 'Minimal pitch' },
                { value: 'complex', label: 'Complex', icon: '🏘️', desc: 'Multiple dormers/valleys' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setManualRoofType(type.value as typeof manualRoofType)}
                  className="p-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: manualRoofType === type.value ? accentColor : '#e2e8f0',
                    background: manualRoofType === type.value ? `${accentColor}10` : 'white',
                  }}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="font-bold text-slate-800 text-sm">{type.label}</div>
                  <div className="text-xs text-slate-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {manualError && (
            <p className="text-sm text-red-500 font-medium">{manualError}</p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-amber-700 font-medium">
          <strong>Note:</strong> Manual estimates have a wider price range (±25%) to account for actual roof complexity. A professional site visit will confirm exact measurements.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleManualSubmit}
          className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: accentColor }}
        >
          Continue with Estimate <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
