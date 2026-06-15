'use client';

import { useState } from 'react';
import { Users, TrendingUp, DollarSign, Star, ExternalLink, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string;
  estimatedPriceMin: number | null;
  estimatedPriceMax: number | null;
  selectedMaterial: string | null;
  status: string;
  measurementSource: string | null;
  createdAt: Date | string;
}

interface DashboardProps {
  orgName: string;
  orgSlug: string;
  tutorialCompleted: boolean;
  subscriptionStatus: string;
  stats: {
    totalLeads: number;
    newLeads: number;
    qualifiedLeads: number;
    avgEstimate: number | null;
  };
  recentLeads: Lead[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: '#dbeafe', text: '#1d4ed8', label: 'New' },
  contacted: { bg: '#fef3c7', text: '#d97706', label: 'Contacted' },
  qualified: { bg: '#d1fae5', text: '#059669', label: 'Qualified' },
  closed: { bg: '#f0fdf4', text: '#16a34a', label: 'Closed' },
  lost: { bg: '#fef2f2', text: '#dc2626', label: 'Lost' },
};

const TUTORIAL_STEPS = [
  { id: 'pricing', href: '/admin/pricing', title: 'Configure Pricing', desc: 'Set up materials and options', icon: '💰' },
  { id: 'installation', href: '/admin/installation', title: 'Install the Widget', desc: 'Add the embed code to your site', icon: '🔧' },
  { id: 'settings', href: '/admin/settings', title: 'Customize Branding', desc: 'Set your logo, colors, and notifications', icon: '🎨' },
];

export default function AdminDashboardClient({
  orgName, orgSlug, tutorialCompleted, subscriptionStatus, stats, recentLeads,
}: DashboardProps) {
  const [tutorialDismissed, setTutorialDismissed] = useState(tutorialCompleted);

  const handleDismissTutorial = async () => {
    setTutorialDismissed(true);
    await fetch('/api/admin/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete-tutorial' }),
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">{orgName}</h1>
        <p className="text-slate-500 text-sm mt-1">
          Subscription:{' '}
          <span
            className="font-semibold capitalize"
            style={{ color: subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? '#16a34a' : '#dc2626' }}
          >
            {subscriptionStatus}
          </span>
          {' '}·{' '}
          <Link href={`/${orgSlug}`} target="_blank" className="text-blue-500 hover:underline inline-flex items-center gap-1">
            View Public Page <ExternalLink size={11} />
          </Link>
        </p>
      </div>

      {/* Tutorial */}
      {!tutorialDismissed && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a9e] rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
          <button
            onClick={handleDismissTutorial}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
          <h2 className="font-black text-lg mb-1">Welcome to RoofQuote! 🏠</h2>
          <p className="text-blue-200 text-sm mb-5">Complete these steps to start receiving leads:</p>
          <div className="grid md:grid-cols-3 gap-3">
            {TUTORIAL_STEPS.map((step, i) => (
              <Link
                key={step.id}
                href={step.href}
                className="bg-white/10 hover:bg-white/15 rounded-xl p-4 transition-all flex items-start gap-3"
              >
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold text-blue-200">Step {i + 1}</span>
                  </div>
                  <p className="font-bold text-sm">{step.title}</p>
                  <p className="text-blue-300 text-xs">{step.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: stats.totalLeads.toString(), icon: Users, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'New Leads', value: stats.newLeads.toString(), icon: TrendingUp, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Qualified', value: stats.qualifiedLeads.toString(), icon: Star, color: '#f59e0b', bg: '#fffbeb' },
          {
            label: 'Avg Estimate',
            value: stats.avgEstimate ? `$${stats.avgEstimate.toLocaleString()}` : '—',
            icon: DollarSign,
            color: '#10b981',
            bg: '#ecfdf5',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-xs text-blue-500 font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-bold text-slate-700 mb-1">No leads yet</p>
            <p className="text-slate-400 text-sm">Install the widget on your site to start receiving roofing leads.</p>
            <Link href="/admin/installation" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5080] transition-all">
              Install Widget
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentLeads.map((lead) => {
              const status = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
              return (
                <div key={lead.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-all">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-500">
                      {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{lead.address}</p>
                  </div>
                  <div className="hidden md:block text-right mr-4">
                    {lead.estimatedPriceMin && lead.estimatedPriceMax ? (
                      <p className="font-bold text-slate-800 text-sm">
                        ${lead.estimatedPriceMin.toLocaleString()}–${lead.estimatedPriceMax.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs">No estimate</p>
                    )}
                    <p className="text-xs text-slate-400">{lead.selectedMaterial || '—'}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                    style={{ background: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
