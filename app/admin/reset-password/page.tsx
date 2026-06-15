'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setSuccess(true);
      setTimeout(() => router.push('/admin/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return (
    <div className="text-center p-8">
      <p className="text-red-500 font-medium mb-4">Invalid or missing reset token.</p>
      <Link href="/admin/forgot-password" className="text-[#1e3a5f] font-semibold hover:underline">Request a new link</Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success ? (
        <div className="text-center">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
          <p className="font-bold text-slate-900">Password updated! Redirecting...</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Min 8 characters"
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60" style={{ background: '#1e3a5f' }}>
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Set New Password'}
          </button>
        </>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: '#e85d04' }}>
            <span className="text-white font-black text-xl">RQ</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">New Password</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Suspense fallback={<div className="text-center text-slate-400">Loading...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
