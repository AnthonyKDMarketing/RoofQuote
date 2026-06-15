'use client';

import { useEffect } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { calculateEstimate } from '@/lib/roofCalc';
import type { Material, Option, WasteFactors, PricingConfig } from '@/lib/roofCalc';

interface Step5Props {
  accentColor: string;
  primaryColor: string;
  pricing: {
    materials: Material[];
    options: Option[];
    minimumJobValue: number;
    priceRangeBuffer: number;
    wasteFactor: WasteFactors;
  } | null;
  materials: Material[];
  options: Option[];
}

export default function Step5Summary({ accentColor, primaryColor, pricing, materials, options }: Step5Props) {
  const {
    effectiveSquares, effectiveSqFt, effectiveComplexity, measurementSource,
    selectedMaterialId, selectedOptionIds, setEstimate, nextStep, prevStep,
    estimatedPriceMin, estimatedPriceMax,
  } = useQuoteStore();

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  useEffect(() => {
    if (!selectedMaterialId || !pricing) return;

    try {
      const config: PricingConfig = {
        materials: pricing.materials,
        options: pricing.options,
        minimumJobValue: pricing.minimumJobValue,
        priceRangeBuffer: measurementSource === 'manual' ? 0.25 : (pricing.priceRangeBuffer || 0.15),
        wasteFactor: pricing.wasteFactor,
      };

      const result = calculateEstimate(
        effectiveSquares,
        effectiveSqFt,
        selectedMaterialId,
        selectedOptionIds,
        config,
        effectiveComplexity
      );

      setEstimate(result.priceMin, result.priceMax);
    } catch (e) {
      console.error('Estimate calculation error:', e);
    }
  }, [effectiveSquares, effectiveSqFt, selectedMaterialId, selectedOptionIds, pricing, setEstimate, effectiveComplexity, measurementSource]);

  if (!selectedMaterial || estimatedPriceMin === null || estimatedPriceMax === null) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 rounded-full mx-auto" style={{ borderTopColor: accentColor }} />
        <p className="text-slate-400 mt-4 text-sm">Calculating your estimate...</p>
      </div>
    );
  }

  const selectedOptionDetails = options.filter((o) => selectedOptionIds.includes(o.id));

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Your Roofing Estimate</h2>
        <p className="text-slate-500 text-sm">Based on your roof measurements and selected materials.</p>
      </div>

      {/* Big price display */}
      <div
        className="rounded-2xl p-8 text-center text-white mb-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-8 translate-y-8" />
        </div>
        <div className="relative">
          <p className="text-white/70 text-sm font-semibold mb-2 uppercase tracking-wider">Estimated Project Cost</p>
          <p className="text-4xl md:text-5xl font-black mb-2">
            ${estimatedPriceMin.toLocaleString()} – ${estimatedPriceMax.toLocaleString()}
          </p>
          <p className="text-white/60 text-sm">
            {effectiveSquares.toFixed(1)} squares · {selectedMaterial.name}
          </p>
          {measurementSource === 'manual' && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white/80">
              <AlertTriangle size={12} />
              Manual estimate — wider range applies
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50 mb-6">
        <div className="px-5 py-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Breakdown</p>
        </div>

        <div className="px-5 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 text-sm">{selectedMaterial.name}</p>
            <p className="text-xs text-slate-400">Materials + Labor · {effectiveSquares.toFixed(1)} sq</p>
          </div>
          <p className="font-bold text-slate-800 text-sm">
            ${Math.round(effectiveSquares * selectedMaterial.pricePerSquare * selectedMaterial.laborMultiplier).toLocaleString()}
          </p>
        </div>

        {selectedOptionDetails.map((option) => {
          let cost = 0;
          if (option.pricingType === 'flat') cost = option.value;
          else if (option.pricingType === 'per_square') cost = Math.round(option.value * effectiveSquares);
          else if (option.pricingType === 'per_sqft') cost = Math.round(option.value * effectiveSqFt);
          return (
            <div key={option.id} className="px-5 py-3 flex items-center justify-between">
              <p className="text-sm text-slate-700">{option.name}</p>
              <p className="font-bold text-slate-600 text-sm">+${cost.toLocaleString()}</p>
            </div>
          );
        })}

        <div className="px-5 py-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-900">Price Range</p>
            <p className="font-black text-slate-900" style={{ color: accentColor }}>
              ${estimatedPriceMin.toLocaleString()} – ${estimatedPriceMax.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {measurementSource === 'manual' ? '±25% range for manual estimates' : '±15% range — confirmed after site visit'}
          </p>
        </div>
      </div>

      {/* Measurements recap */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Measurement Details</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-500">Roof Area:</span>
          <span className="font-medium text-slate-700">{effectiveSqFt.toLocaleString()} sq ft</span>
          <span className="text-slate-500">Squares w/ Waste:</span>
          <span className="font-medium text-slate-700">{effectiveSquares.toFixed(1)} sq</span>
          <span className="text-slate-500">Data Source:</span>
          <span className="font-medium text-slate-700 capitalize">
            {measurementSource === 'solar_api' ? '🛰️ Aerial Scan' : '✏️ Manual Entry'}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: accentColor }}
        >
          Get My Free Quote <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
