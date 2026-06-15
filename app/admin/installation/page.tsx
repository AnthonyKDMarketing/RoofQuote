'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

const CODE_TABS = ['iframe', 'script'] as const;
type CodeTab = typeof CODE_TABS[number];

export default function InstallationPage() {
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState<CodeTab | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('iframe');

  useEffect(() => {
    fetch('/api/admin/organization')
      .then(r => r.json())
      .then(d => setSlug(d.slug || ''));
  }, []);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://roofquote.com';

  const EMBED_CODES: Record<CodeTab, string> = {
    iframe: `<!-- RoofQuote Widget - Paste in your website HTML -->
<div id="roofquote-container" style="width:100%;min-height:600px;">
  <iframe
    src="${appUrl}/${slug}"
    width="100%"
    height="700"
    frameborder="0"
    style="border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);"
    title="Get a Roofing Estimate"
  ></iframe>
</div>`,
    script: `<!-- RoofQuote Widget Script Embed -->
<div id="roofquote-widget"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${appUrl}/${slug}';
    iframe.style = 'width:100%;height:700px;border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.12);';
    iframe.title = 'Get a Roofing Estimate';
    document.getElementById('roofquote-widget').appendChild(iframe);
  })();
</script>`,
  };

  const handleCopy = async (tab: CodeTab) => {
    await navigator.clipboard.writeText(EMBED_CODES[tab]);
    setCopied(tab);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Widget Installation</h1>
        <p className="text-slate-500 text-sm">Add the RoofQuote widget to your website in minutes</p>
      </div>

      {/* Live URL */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-3">Your Estimate Page URL</h2>
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
          <span className="text-sm text-slate-600 flex-1 truncate font-mono">{appUrl}/{slug}</span>
          <a href={`/${slug}`} target="_blank" className="flex items-center gap-1 text-blue-500 text-xs font-semibold hover:underline">
            Preview <ExternalLink size={11} />
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-2">Share this link directly or embed it on your site using the code below.</p>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Embed Code</h2>

        <div className="flex gap-2 mb-4">
          {CODE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={{
                background: activeTab === tab ? '#1e3a5f' : '#f1f5f9',
                color: activeTab === tab ? 'white' : '#64748b',
              }}
            >
              {tab === 'iframe' ? 'iFrame Embed' : 'Script Embed'}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="bg-slate-900 text-slate-100 text-xs rounded-xl p-5 overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono">
            {EMBED_CODES[activeTab]}
          </pre>
          <button
            onClick={() => handleCopy(activeTab)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: copied === activeTab ? '#10b981' : '#334155',
              color: 'white',
            }}
          >
            {copied === activeTab ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-4">Installation Steps</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Copy the embed code', desc: 'Choose iFrame (simpler) or Script embed above and copy it.' },
            { step: '2', title: 'Paste into your website', desc: 'Add it to any page — your homepage, a dedicated estimate page, or a landing page.' },
            { step: '3', title: 'Test the widget', desc: 'Visit your page and walk through the estimate flow to verify everything works.' },
            { step: '4', title: 'Go live!', desc: 'Start receiving leads directly in your RoofQuote dashboard.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ background: '#1e3a5f' }}>
                {item.step}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
