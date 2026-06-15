import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QuoteWizard from '@/components/quote/QuoteWizard';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug }, select: { name: true } });
  return {
    title: org ? `Get a Roofing Estimate — ${org.name}` : 'RoofQuote',
    description: 'Get an instant, accurate roofing estimate powered by aerial measurement technology.',
  };
}

export default async function OrgQuotePage({ params }: PageProps) {
  const { slug } = await params;
  const org = await prisma.organization.findUnique({
    where: { slug },
    include: { pricing: { where: { name: 'default' }, take: 1 } },
  });

  if (!org) notFound();

  const isActive = org.subscriptionStatus === 'active' || org.subscriptionStatus === 'trialing';
  const pricing = org.pricing[0] || null;

  return (
    <QuoteWizard
      orgSlug={slug}
      orgName={org.name}
      primaryColor={org.primaryColor}
      accentColor={org.accentColor}
      logoUrl={org.logoUrl ?? null}
      isActive={isActive}
      pricing={pricing
        ? {
            materials: pricing.materials as never,
            options: pricing.options as never,
            minimumJobValue: pricing.minimumJobValue,
            priceRangeBuffer: pricing.priceRangeBuffer,
            wasteFactor: pricing.wasteFactor as never,
          }
        : null}
    />
  );
}
