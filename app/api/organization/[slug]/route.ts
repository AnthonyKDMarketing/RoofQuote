import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: { pricing: { where: { name: 'default' }, take: 1 } },
    });

    if (!org) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check subscription
    const isActive =
      org.subscriptionStatus === 'active' || org.subscriptionStatus === 'trialing';

    const pricing = org.pricing[0] || null;

    return NextResponse.json({
      id: org.id,
      slug: org.slug,
      name: org.name,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      accentColor: org.accentColor,
      logoUrl: org.logoUrl,
      font: org.font,
      isActive,
      pricing: pricing
        ? {
            materials: pricing.materials,
            options: pricing.options,
            minimumJobValue: pricing.minimumJobValue,
            priceRangeBuffer: pricing.priceRangeBuffer,
            wasteFactor: pricing.wasteFactor,
          }
        : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
