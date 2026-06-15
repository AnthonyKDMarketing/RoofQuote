'use client';

import { useQuoteStore } from '@/store/quoteStore';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import type { Option } from '@/lib/roofCalc';

interface Step4Props {
  accentColor: string;
  options: Option[];
}

function formatOptionPrice(option: Option, squares: number, sqFt: number): string {
  switch (option.pricingType) {
    case 'flat':
      return `+$${option.value.toLocaleString()}`;
    case 'per_square':
      return `+$${(option.value * squares).toLocaleString()} ($${option.value}/sq)`;
    case 'per_sqft':
      return `+$${Math.round(option.value * sqFt).toLocaleString()} ($${option.value}/sqft)`;
    default:
      return '';
  }
}

export default function Step4Options({ accentColor, options }: Step4Props) {
  const { selectedOptionIds, toggleOption, nextStep, prevStep, effectiveSquares, effectiveSqFt } = useQuoteStore();

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Project Options</h2>
        <p className="text-slate-500 text-sm">
          Select any additional services that apply to your project. All items are optional.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {options.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <p className="text-slate-400">No additional options available.</p>
          </div>
        ) : (
          options.map((option) => {
            const isSelected = selectedOptionIds.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className="w-full text-left bg-white rounded-xl border-2 px-5 py-4 transition-all hover:shadow-sm active:scale-[0.99] flex items-center justify-between gap-4"
                style={{
                  borderColor: isSelected ? accentColor : '#e2e8f0',
                  background: isSelected ? `${accentColor}06` : 'white',
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: isSelected ? accentColor : '#cbd5e1',
                      background: isSelected ? accentColor : 'transparent',
                    }}
                  >
                    {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm">{option.name}</div>
                    {option.description && (
                      <div className="text-xs text-slate-400 truncate">{option.description}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm font-bold shrink-0" style={{ color: isSelected ? accentColor : '#94a3b8' }}>
                  {formatOptionPrice(option, effectiveSquares, effectiveSqFt)}
                </div>
              </button>
            );
          })
        )}
      </div>

      {selectedOptionIds.length > 0 && (
        <div className="bg-slate-50 rounded-xl px-5 py-3 flex items-center justify-between mb-6 border border-slate-200">
          <span className="text-sm text-slate-500">{selectedOptionIds.length} option{selectedOptionIds.length > 1 ? 's' : ''} selected</span>
          <button
            onClick={() => selectedOptionIds.forEach((id) => toggleOption(id))}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

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
          See My Estimate <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
