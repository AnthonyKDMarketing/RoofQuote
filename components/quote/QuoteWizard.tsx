'use client';

import { useEffect } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import Step1Address from './steps/Step1Address';
import Step2RoofAnalysis from './steps/Step2RoofAnalysis';
import Step3Material from './steps/Step3Material';
import Step4Options from './steps/Step4Options';
import Step5Summary from './steps/Step5Summary';
import Step6LeadCapture from './steps/Step6LeadCapture';
import ConfirmationScreen from './ConfirmationScreen';
import type { Material, Option, WasteFactors } from '@/lib/roofCalc';

interface PricingConfig {
  materials: Material[];
  options: Option[];
  minimumJobValue: number;
  priceRangeBuffer: number;
  wasteFactor: WasteFactors;
}

interface QuoteWizardProps {
  orgSlug: string;
  orgName: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  isActive: boolean;
  pricing: PricingConfig | null;
}

const STEPS = [
  { num: 1, label: 'Address' },
  { num: 2, label: 'Roof Scan' },
  { num: 3, label: 'Material' },
  { num: 4, label: 'Options' },
  { num: 5, label: 'Estimate' },
  { num: 6, label: 'Contact' },
];

export default function QuoteWizard({
  orgSlug, orgName, primaryColor, accentColor, logoUrl, isActive, pricing,
}: QuoteWizardProps) {
  const { currentStep, isSubmitted, reset } = useQuoteStore();

  useEffect(() => {
    reset();
  }, [reset]);

  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <div className="text-4xl mb-4">🏠</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Quote Tool Unavailable</h2>
          <p className="text-slate-500 text-sm">
            This roofing estimation tool is currently unavailable. Please contact {orgName} directly.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return <ConfirmationScreen orgName={orgName} accentColor={accentColor} />;
  }

  const activeMaterials = pricing?.materials?.filter((m: Material) => m.isActive) ?? [];
  const activeOptions = pricing?.options?.filter((o: Option) => o.isActive) ?? [];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ '--primary': primaryColor, '--accent': accentColor } as React.CSSProperties}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 shadow-md"
        style={{ background: primaryColor }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={orgName} className="h-8 w-auto object-contain" />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: accentColor }}
              >
                {orgName.charAt(0)}
              </div>
            )}
            <span className="text-white font-bold text-base truncate max-w-[180px]">{orgName}</span>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: `${accentColor}33`, color: accentColor === '#ffffff' ? '#fff' : '#fff' }}
          >
            Free Estimate
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-1">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="h-1.5 rounded-full w-full transition-all duration-500"
                    style={{
                      background:
                        currentStep > step.num
                          ? accentColor
                          : currentStep === step.num
                          ? `${accentColor}88`
                          : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <span className="text-[10px] text-white/60 mt-1 font-medium hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <div className="w-1" />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
          <div className="animate-fade-in" key={currentStep}>
            {currentStep === 1 && <Step1Address accentColor={accentColor} />}
            {currentStep === 2 && <Step2RoofAnalysis accentColor={accentColor} primaryColor={primaryColor} />}
            {currentStep === 3 && (
              <Step3Material
                accentColor={accentColor}
                materials={activeMaterials}
              />
            )}
            {currentStep === 4 && (
              <Step4Options
                accentColor={accentColor}
                options={activeOptions}
              />
            )}
            {currentStep === 5 && (
              <Step5Summary
                accentColor={accentColor}
                primaryColor={primaryColor}
                pricing={pricing}
                materials={activeMaterials}
                options={activeOptions}
              />
            )}
            {currentStep === 6 && (
              <Step6LeadCapture
                accentColor={accentColor}
                orgSlug={orgSlug}
                materials={activeMaterials}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-slate-400">
          Powered by{' '}
          <span className="font-semibold text-slate-500">RoofQuote</span>
          {' '}· Estimates are preliminary and subject to on-site verification
        </p>
      </footer>
    </div>
  );
}
