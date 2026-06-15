'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Calendar } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'closed', 'lost'];
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: '#dbeafe', text: '#1d4ed8' },
  contacted: { bg: '#fef3c7', text: '#d97706' },
  qualified: { bg: '#d1fae5', text: '#059669' },
  closed: { bg: '#f0fdf4', text: '#16a34a' },
  lost: { bg: '#fef2f2', text: '#dc2626' },
};

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
  roofSquares: number | null;
  measurementSource: string | null;
  status: string;
  intent: string;
  notes: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, string>>({});

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, status: newStatus }),
    });
    fetchLeads();
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleNotesSave = async (leadId: number) => {
    const notes = expandedNotes[leadId] ?? '';
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: leadId, notes }),
    });
    fetchLeads();
  };

  const handleExport = async () => {
    const params = new URLSearchParams({ page: '1', limit: '10000', status: statusFilter, ...(search && { search }) });
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Address', 'Material', 'Squares', 'Min $', 'Max $', 'Source', 'Status', 'Intent'];
    const rows = data.leads.map((l: Lead) => [
      l.id, new Date(l.createdAt).toLocaleDateString(), `${l.firstName} ${l.lastName}`,
      l.email, l.phone || '', l.address, l.selectedMaterial || '', l.roofSquares || '',
      l.estimatedPriceMin || '', l.estimatedPriceMax || '', l.measurementSource || '', l.status, l.intent,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(String).map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `roofquote-leads-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lead Hub</h1>
          <p className="text-slate-500 text-sm">{total} total leads</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, address..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={{
                background: statusFilter === s ? '#1e3a5f' : '#f1f5f9',
                color: statusFilter === s ? 'white' : '#64748b',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Lead List */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400">No leads found.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {leads.map((lead) => {
                  const status = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(isSelected ? null : lead)}
                      className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-all ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-slate-500">
                            {lead.firstName[0]}{lead.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm">{lead.firstName} {lead.lastName}</p>
                          <p className="text-xs text-slate-400 truncate">{lead.address}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {lead.estimatedPriceMin && (
                            <p className="text-sm font-bold text-slate-800">
                              ${lead.estimatedPriceMin.toLocaleString()}–${lead.estimatedPriceMax?.toLocaleString()}
                            </p>
                          )}
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold capitalize" style={{ background: status.bg, color: status.text }}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Pagination */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">{Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</p>
                <div className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="w-80 shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5 self-start sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">{selectedLead.firstName} {selectedLead.lastName}</h3>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" /> {selectedLead.email}</div>
              {selectedLead.phone && <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {selectedLead.phone}</div>}
              <div className="flex items-start gap-2 text-slate-600"><MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" /> {selectedLead.address}</div>
              <div className="flex items-center gap-2 text-slate-600"><Calendar size={14} className="text-slate-400" /> {new Date(selectedLead.createdAt).toLocaleDateString()}</div>
            </div>

            {(selectedLead.estimatedPriceMin !== null) && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs font-bold text-slate-400 mb-1">Estimate</p>
                <p className="font-black text-slate-900">${selectedLead.estimatedPriceMin?.toLocaleString()} – ${selectedLead.estimatedPriceMax?.toLocaleString()}</p>
                {selectedLead.selectedMaterial && <p className="text-xs text-slate-500 mt-0.5">{selectedLead.selectedMaterial}</p>}
                {selectedLead.roofSquares && <p className="text-xs text-slate-500">{selectedLead.roofSquares} squares · {selectedLead.measurementSource === 'solar_api' ? '🛰️ Aerial' : '✏️ Manual'}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={selectedLead.status}
                onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none"
              >
                {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Notes</label>
              <textarea
                value={expandedNotes[selectedLead.id] ?? (selectedLead.notes || '')}
                onChange={(e) => setExpandedNotes(prev => ({ ...prev, [selectedLead.id]: e.target.value }))}
                rows={3}
                placeholder="Add notes about this lead..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
              <button
                onClick={() => handleNotesSave(selectedLead.id)}
                className="mt-2 w-full py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#2d5080] transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
