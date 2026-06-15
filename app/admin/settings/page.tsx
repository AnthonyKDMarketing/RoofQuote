'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Bell, Globe, Palette, Image } from 'lucide-react';

interface OrgSettings {
  name: string;
  website: string | null;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  adminEmail: string | null;
  adminPhone: string | null;
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookUrl: string | null;
  slug: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/organization')
      .then(r => r.json())
      .then(d => setSettings(d))
      .finally(() => setIsLoading(false));
  }, []);

  const update = (key: keyof OrgSettings, value: unknown) => {
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

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]';

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm">Branding, notifications, and company info</p>
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
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={17} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Company Info</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Name</label>
              <input value={settings.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Website</label>
              <input value={settings.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://yourcompany.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Widget URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">{typeof window !== 'undefined' ? window.location.origin : 'https://roofquote.com'}/</span>
                <input value={settings.slug} readOnly className={`${inputClass} bg-slate-50 cursor-not-allowed text-slate-400`} />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={17} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Branding</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} className="h-10 w-10 rounded-lg cursor-pointer border border-slate-200" />
                <input value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.accentColor} onChange={e => update('accentColor', e.target.value)} className="h-10 w-10 rounded-lg cursor-pointer border border-slate-200" />
                <input value={settings.accentColor} onChange={e => update('accentColor', e.target.value)} className={`${inputClass} flex-1`} />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Logo URL</label>
            <input value={settings.logoUrl || ''} onChange={e => update('logoUrl', e.target.value)} placeholder="https://yourcompany.com/logo.png" className={inputClass} />
            {settings.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="Logo preview" className="mt-2 h-10 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={17} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Lead Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Notification Email</label>
                <input value={settings.adminEmail || ''} onChange={e => update('adminEmail', e.target.value)} placeholder="owner@yourcompany.com" type="email" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">SMS Phone (Twilio)</label>
                <input value={settings.adminPhone || ''} onChange={e => update('adminPhone', e.target.value)} placeholder="+15550001234" className={inputClass} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-400">Receive an email for each new lead</p>
              </div>
              <button
                onClick={() => update('emailNotifications', !settings.emailNotifications)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.emailNotifications ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-all ${settings.emailNotifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-800">SMS Notifications</p>
                <p className="text-xs text-slate-400">Requires Twilio configuration in .env</p>
              </div>
              <button
                onClick={() => update('smsNotifications', !settings.smsNotifications)}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.smsNotifications ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-all ${settings.smsNotifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Webhook URL (Optional)</label>
              <input value={settings.webhookUrl || ''} onChange={e => update('webhookUrl', e.target.value)} placeholder="https://your-webhook.com/leads" className={inputClass} />
              <p className="text-xs text-slate-400 mt-1">POSTed with each new lead as JSON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
