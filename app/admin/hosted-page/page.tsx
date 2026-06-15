'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Globe, ExternalLink } from 'lucide-react';

interface HostedPageSettings {
  hostedPageEnabled: boolean;
  hostedPageHeadline: string | null;
  hostedPageSubheading: string | null;
  hostedPagePhone: string | null;
  hostedPageEmail: string | null;
  hostedPageCity: string | null;
  hostedPageState: string | null;
  hostedPageCoverUrl: string | null;
  slug: string;
  name: string;
}

export default function HostedPagePage() {
  const [settings, setSettings] = useState<HostedPageSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/organization')
      .then(r => r.json())
      .then(d => setSettings(d))
      .finally(() => setIsLoading(false));
  }, []);

  const update = (key: keyof HostedPageSettings, value: unknown) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    await fetch('/api/admin/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (isLoading || !settings) {
    return <div className="p-8 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-slate-400" /></div>;
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://roofquote.com';
  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]';

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Hosted Page</h1>
          <p className="text-slate-500 text-sm">Customize your shareable public estimate page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
          style={{ background: saved ? '#10b981' : '#1e3a5f' }}
        >
          {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Enable Toggle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <p className="font-bold text-slate-900">Enable Hosted Page</p>
                <p className="text-xs text-slate-400">{appUrl}/{settings.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update('hostedPageEnabled', !settings.hostedPageEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.hostedPageEnabled ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-all ${settings.hostedPageEnabled ? 'left-7' : 'left-1'}`} />
              </button>
              <a href={`/${settings.slug}`} target="_blank" className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-4">Page Content</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Headline</label>
              <input
                value={settings.hostedPageHeadline || ''}
                onChange={e => update('hostedPageHeadline', e.target.value)}
                placeholder={`${settings.name} — Free Roofing Estimates`}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subheading</label>
              <input
                value={settings.hostedPageSubheading || ''}
                onChange={e => update('hostedPageSubheading', e.target.value)}
                placeholder="Get an instant estimate powered by aerial measurement technology"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
              <input
                value={settings.hostedPageCoverUrl || ''}
                onChange={e => update('hostedPageCoverUrl', e.target.value)}
                placeholder="https://yourcompany.com/roof-hero.jpg"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-4">Contact Info Displayed</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone</label>
              <input value={settings.hostedPagePhone || ''} onChange={e => update('hostedPagePhone', e.target.value)} placeholder="(555) 000-0000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input value={settings.hostedPageEmail || ''} onChange={e => update('hostedPageEmail', e.target.value)} placeholder="info@yourcompany.com" type="email" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">City</label>
              <input value={settings.hostedPageCity || ''} onChange={e => update('hostedPageCity', e.target.value)} placeholder="Tampa" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">State</label>
              <input value={settings.hostedPageState || ''} onChange={e => update('hostedPageState', e.target.value)} placeholder="FL" className={inputClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
