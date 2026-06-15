import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'RoofQuote Admin',
  description: 'Manage your roofing leads, pricing, and settings.',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <AdminSidebar organizationId={session.organizationId} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
