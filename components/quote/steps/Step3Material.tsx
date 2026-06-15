'use client';

import { useQuoteStore } from '@/store/quoteStore';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { Material } from '@/lib/roofCalc';

interface Step3Props {
  accentColor: string;
  materials: Material[];
}

export default function Step3Material({ accentColor, materials }: Step3Props) {
  const { selectedMaterialId, setMaterial, nextStep, prevStep } = useQuoteStore();

  const handleSelect = (id: string) => {
    setMaterial(id);
  };

  const handleContinue = () => {
    if (!selectedMaterialId) return;
    nextStep();
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Choose Your Roofing Material</h2>
        <p className="text-slate-500 text-sm">Select the material you&apos;re most interested in. Pricing updates instantly.</p>
      </div>

      <div className="space-y-3 mb-6">
        {materials.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <p className="text-slate-400">No materials configured. Contact us for pricing.</p>
          </div>
        ) : (
          materials.map((material) => {
            const isSelected = selectedMaterialId === material.id;
            return (
              <button
                key={material.id}
                onClick={() => handleSelect(material.id)}
                className="w-full text-left bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-md active:scale-[0.99]"
                style={{
                  borderColor: isSelected ? accentColor : '#e2e8f0',
                  background: isSelected ? `${accentColor}08` : 'white',
                  boxShadow: isSelected ? `0 0 0 3px ${accentColor}22` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{material.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{material.description}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-lg font-black" style={{ color: accentColor }}>
                          ${(material.pricePerSquare * material.laborMultiplier).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ square installed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="text-xs text-slate-500 font-medium">{material.lifespan}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: isSelected ? accentColor : '#cbd5e1',
                      background: isSelected ? accentColor : 'transparent',
                    }}
                  >
                    {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMaterialId}
          className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: accentColor }}
        >
          Continue to Options <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
