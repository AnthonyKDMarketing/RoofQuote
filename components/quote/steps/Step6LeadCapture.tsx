'use client';

import { useState } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { ArrowLeft, Loader2, User, Mail, Phone, MapPin } from 'lucide-react';
import type { Material } from '@/lib/roofCalc';

interface Step6Props {
  accentColor: string;
  orgSlug: string;
  materials: Material[];
}

const INTENT_OPTIONS = [
  { value: 'browsing', label: 'Just exploring options', icon: '🔍' },
  { value: 'quote_request', label: 'Ready for a professional quote', icon: '📋' },
  { value: 'site_visit', label: 'Want to schedule a site visit', icon: '📅' },
];

export default function Step6LeadCapture({ accentColor, orgSlug, materials }: Step6Props) {
  const {
    firstName, lastName, email, phone, address, intent,
    setLeadField, setSubmitting, setSubmitted, isSubmitting,
    estimatedPriceMin, estimatedPriceMax, effectiveSquares, effectiveSqFt,
    selectedMaterialId, selectedOptionIds, lat, lng,
    roofData, manualMeasurement, measurementSource, effectiveComplexity,
    prevStep,
  } = useQuoteStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        organizationSlug: orgSlug,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        address,
        lat,
        lng,
        measurementSource,
        roofSquares: effectiveSquares,
        roofAreaSqFt: effectiveSqFt,
        roofPitchDegrees: roofData?.avgPitchDegrees || null,
        roofComplexity: effectiveComplexity,
        roofSegmentCount: roofData?.segmentCount || null,
        roofDataJson: roofData ? {
          segments: roofData.segments.length,
          imageryQuality: roofData.imageryQuality,
          groundAreaSqFt: roofData.groundAreaSqFt,
        } : null,
        manualHomeSqFt: manualMeasurement?.homeSqFt || null,
        manualRoofType: manualMeasurement?.roofType || null,
        manualStories: manualMeasurement?.stories || null,
        selectedMaterial: selectedMaterial?.name || null,
        selectedOptions: selectedOptionIds,
        estimatedPriceMin,
        estimatedPriceMax,
        intent,
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Almost Done!</h2>
        <p className="text-slate-500 text-sm">
          Enter your contact info to receive your estimate and have a professional reach out.
        </p>
      </div>

      {/* Estimate recap */}
      {estimatedPriceMin !== null && estimatedPriceMax !== null && (
        <div
          className="rounded-xl px-5 py-4 mb-6 flex items-center justify-between"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>Your Estimate</p>
            <p className="font-black text-slate-900 text-lg">
              ${estimatedPriceMin.toLocaleString()} – ${estimatedPriceMax.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{effectiveSquares.toFixed(1)} squares</p>
            <p className="text-xs text-slate-500 truncate max-w-[120px]">{selectedMaterial?.name}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">First Name *</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setLeadField('firstName', e.target.value); setErrors((p) => ({ ...p, firstName: '' })); }}
                placeholder="John"
                className="w-full pl-9 pr-3 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                style={{ borderColor: errors.firstName ? '#ef4444' : '#e2e8f0' }}
              />
            </div>
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLeadField('lastName', e.target.value); setErrors((p) => ({ ...p, lastName: '' })); }}
              placeholder="Smith"
              className="w-full px-3 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
              style={{ borderColor: errors.lastName ? '#ef4444' : '#e2e8f0' }}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address *</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setLeadField('email', e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              placeholder="john@example.com"
              className="w-full pl-9 pr-3 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
              style={{ borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setLeadField('phone', e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Project address (read-only) */}
        {address && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Project Address</label>
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin size={15} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 truncate">{address}</span>
            </div>
          </div>
        )}

        {/* Intent */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">What best describes you?</label>
          <div className="space-y-2">
            {INTENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLeadField('intent', opt.value)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all"
                style={{
                  borderColor: intent === opt.value ? accentColor : '#e2e8f0',
                  background: intent === opt.value ? `${accentColor}08` : 'white',
                }}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: accentColor }}
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Submitting...</>
            ) : (
              'Submit & Get My Quote'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400">
          By submitting, you agree to be contacted about your roofing project. No spam, ever.
        </p>
      </form>
    </div>
  );
}
