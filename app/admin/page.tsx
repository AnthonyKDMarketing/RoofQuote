import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, TrendingUp, DollarSign, Star } from 'lucide-react';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, slug: true, tutorialCompleted: true, subscriptionStatus: true },
  });

  const [totalLeads, newLeads, qualifiedLeads, totalRevenue] = await Promise.all([
    prisma.lead.count({ where: { organizationId: session.organizationId } }),
    prisma.lead.count({ where: { organizationId: session.organizationId, status: 'new' } }),
    prisma.lead.count({ where: { organizationId: session.organizationId, status: 'qualified' } }),
    prisma.lead.aggregate({
      where: { organizationId: session.organizationId },
      _avg: { estimatedPriceMin: true, estimatedPriceMax: true },
    }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  const avgEstimate =
    totalRevenue._avg.estimatedPriceMin && totalRevenue._avg.estimatedPriceMax
      ? Math.round((totalRevenue._avg.estimatedPriceMin + totalRevenue._avg.estimatedPriceMax) / 2)
      : null;

  return (
    <AdminDashboardClient
      orgName={org?.name || 'My Company'}
      orgSlug={org?.slug || ''}
      tutorialCompleted={org?.tutorialCompleted || false}
      subscriptionStatus={org?.subscriptionStatus || 'trialing'}
      stats={{ totalLeads, newLeads, qualifiedLeads, avgEstimate }}
      recentLeads={recentLeads}
    />
  );
}
