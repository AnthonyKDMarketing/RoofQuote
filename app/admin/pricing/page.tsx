'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, Info } from 'lucide-react';
import type { Material, Option } from '@/lib/roofCalc';
import { DEFAULT_MATERIALS, DEFAULT_OPTIONS } from '@/lib/roofCalc';

interface Pricing {
  materials: Material[];
  options: Option[];
  minimumJobValue: number;
  priceRangeBuffer: number;
  wasteFactor: { simple: number; moderate: number; complex: number };
}

function newMaterial(): Material {
  return {
    id: `mat-${Date.now()}`,
    name: '',
    description: '',
    pricePerSquare: 300,
    laborMultiplier: 2.0,
    lifespan: '25 years',
    isActive: true,
  };
}

function newOption(): Option {
  return {
    id: `opt-${Date.now()}`,
    name: '',
    description: '',
    pricingType: 'flat',
    value: 250,
    isActive: true,
  };
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then((r) => r.json())
      .then((d) => {
        setPricing({
          materials: (d.materials as Material[]) || DEFAULT_MATERIALS,
          options: (d.options as Option[]) || DEFAULT_OPTIONS,
          minimumJobValue: d.minimumJobValue || 1500,
          priceRangeBuffer: d.priceRangeBuffer || 0.15,
          wasteFactor: d.wasteFactor || { simple: 0.10, moderate: 0.15, complex: 0.20 },
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!pricing) return;
    setIsSaving(true);
    await fetch('/api/admin/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pricing),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateMaterial = (idx: number, field: keyof Material, value: unknown) => {
    setPricing((prev) => {
      if (!prev) return prev;
      const materials = [...prev.materials];
      materials[idx] = { ...materials[idx], [field]: value };
      return { ...prev, materials };
    });
  };

  const updateOption = (idx: number, field: keyof Option, value: unknown) => {
    setPricing((prev) => {
      if (!prev) return prev;
      const options = [...prev.options];
      options[idx] = { ...options[idx], [field]: value };
      return { ...prev, options };
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pricing Configuration</h1>
          <p className="text-slate-500 text-sm">Configure materials, options, and estimate settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: saved ? '#10b981' : '#1e3a5f' }}
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Global Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Global Settings</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Minimum Job Value ($)</label>
            <input
              type="number"
              value={pricing.minimumJobValue}
              onChange={(e) => setPricing(prev => prev ? { ...prev, minimumJobValue: parseInt(e.target.value) || 0 } : prev)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Price Range Buffer</label>
            <select
              value={pricing.priceRangeBuffer}
              onChange={(e) => setPricing(prev => prev ? { ...prev, priceRangeBuffer: parseFloat(e.target.value) } : prev)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
            >
              {[0.05, 0.10, 0.15, 0.20, 0.25].map(v => (
                <option key={v} value={v}>±{(v * 100).toFixed(0)}%</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Waste Factors</label>
            <div className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
              Simple: {(pricing.wasteFactor.simple * 100).toFixed(0)}% · Moderate: {(pricing.wasteFactor.moderate * 100).toFixed(0)}% · Complex: {(pricing.wasteFactor.complex * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Materials */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Roofing Materials</h2>
          <button
            onClick={() => setPricing(prev => prev ? { ...prev, materials: [...prev.materials, newMaterial()] } : prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            <Plus size={13} /> Add Material
          </button>
        </div>
        <div className="space-y-3">
          {pricing.materials.map((mat, idx) => (
            <div key={mat.id} className={`border rounded-xl p-4 transition-all ${mat.isActive ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <input
                  value={mat.name}
                  onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                  placeholder="Material name"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                />
                <input
                  value={mat.description}
                  onChange={(e) => updateMaterial(idx, 'description', e.target.value)}
                  placeholder="Short description"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">$/Square (Material)</label>
                  <input
                    type="number"
                    value={mat.pricePerSquare}
                    onChange={(e) => updateMaterial(idx, 'pricePerSquare', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Labor Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mat.laborMultiplier}
                    onChange={(e) => updateMaterial(idx, 'laborMultiplier', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Lifespan</label>
                  <input
                    value={mat.lifespan}
                    onChange={(e) => updateMaterial(idx, 'lifespan', e.target.value)}
                    placeholder="25 years"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => updateMaterial(idx, 'isActive', !mat.isActive)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${mat.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {mat.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setPricing(prev => prev ? { ...prev, materials: prev.materials.filter((_, i) => i !== idx) } : prev)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Installed price: ${((mat.pricePerSquare || 0) * (mat.laborMultiplier || 1)).toFixed(0)}/sq
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Add-On Options</h2>
          <button
            onClick={() => setPricing(prev => prev ? { ...prev, options: [...prev.options, newOption()] } : prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            <Plus size={13} /> Add Option
          </button>
        </div>
        <div className="space-y-3">
          {pricing.options.map((opt, idx) => (
            <div key={opt.id} className={`border rounded-xl p-4 transition-all ${opt.isActive ? 'border-slate-200' : 'border-slate-100 opacity-50'}`}>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <input
                  value={opt.name}
                  onChange={(e) => updateOption(idx, 'name', e.target.value)}
                  placeholder="Option name"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                />
                <input
                  value={opt.description}
                  onChange={(e) => updateOption(idx, 'description', e.target.value)}
                  placeholder="Description"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Pricing Type</label>
                  <select
                    value={opt.pricingType}
                    onChange={(e) => updateOption(idx, 'pricingType', e.target.value as Option['pricingType'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="flat">Flat Rate</option>
                    <option value="per_square">Per Square</option>
                    <option value="per_sqft">Per Sq Ft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={opt.value}
                    onChange={(e) => updateOption(idx, 'value', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={() => updateOption(idx, 'isActive', !opt.isActive)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${opt.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {opt.isActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setPricing(prev => prev ? { ...prev, options: prev.options.filter((_, i) => i !== idx) } : prev)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
