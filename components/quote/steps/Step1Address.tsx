'use client';

import { useState, useCallback } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { MapPin, ArrowRight, Search, Loader2 } from 'lucide-react';

interface Step1Props {
  accentColor: string;
}

export default function Step1Address({ accentColor }: Step1Props) {
  const { setAddress, nextStep } = useQuoteStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError('Please enter a property address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/roof/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: inputValue }),
      });

      if (!res.ok) {
        setError('Address not found. Please try a more specific address.');
        return;
      }

      const data = await res.json();
      setAddress(data.formattedAddress, data.lat, data.lng);
      nextStep();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, setAddress, nextStep]);

  return (
    <div className="animate-slide-up">
      {/* Hero area */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          <MapPin size={14} />
          Aerial Roof Measurement Technology
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
          Get Your Instant<br />
          <span className="gradient-text">Roofing Estimate</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto leading-relaxed">
          Enter your property address and we&apos;ll automatically analyze your roof using high-resolution aerial imagery — no contractor visit needed.
        </p>
      </div>

      {/* Address form */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-6">
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Property Address
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setError(''); }}
              placeholder="123 Main St, Anytown, FL 32801"
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
              autoFocus
              autoComplete="street-address"
            />
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="mt-4 w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
            style={{ background: isLoading ? '#94a3b8' : accentColor }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Looking up address...
              </>
            ) : (
              <>
                Analyze My Roof
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: '🛰️', label: 'Aerial Imagery', sub: 'Google satellite data' },
          { icon: '⚡', label: 'Instant Results', sub: 'Under 10 seconds' },
          { icon: '🔒', label: 'No Obligation', sub: 'Free estimate' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs font-bold text-slate-700">{item.label}</div>
            <div className="text-[11px] text-slate-400">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
