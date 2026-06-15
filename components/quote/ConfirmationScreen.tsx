'use client';

import { CheckCircle } from 'lucide-react';

interface ConfirmationProps {
  orgName: string;
  accentColor: string;
}

export default function ConfirmationScreen({ orgName, accentColor }: ConfirmationProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-scale-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ background: `${accentColor}15` }}
        >
          <CheckCircle size={40} style={{ color: accentColor }} />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-3">You&apos;re All Set!</h1>
        <p className="text-slate-500 text-base mb-8 leading-relaxed">
          Your roofing estimate has been submitted to <strong>{orgName}</strong>. 
          Check your email for a copy of your estimate and expect to hear from a roofing professional soon.
        </p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left space-y-4 mb-8">
          {[
            { icon: '📧', title: 'Check your email', desc: 'A copy of your estimate has been sent to your inbox.' },
            { icon: '📞', title: 'Expect a call', desc: 'A roofing specialist will reach out within 1 business day.' },
            { icon: '📋', title: 'Site visit', desc: 'A professional will confirm exact measurements on-site.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400">
          Powered by RoofQuote · Estimate subject to professional verification
        </p>
      </div>
    </div>
  );
}
