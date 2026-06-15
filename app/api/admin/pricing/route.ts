import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_MATERIALS, DEFAULT_OPTIONS } from '@/lib/roofCalc';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let pricing = await prisma.roofPricing.findFirst({
      where: { organizationId: session.organizationId, name: 'default' },
    });

    // Auto-seed defaults if no pricing config exists
    if (!pricing) {
      pricing = await prisma.roofPricing.create({
        data: {
          organizationId: session.organizationId,
          name: 'default',
          materials: DEFAULT_MATERIALS as unknown as never,
          options: DEFAULT_OPTIONS as unknown as never,
        },
      });
    }

    return NextResponse.json(pricing);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { materials, options, minimumJobValue, priceRangeBuffer, wasteFactor } = body;

    const pricing = await prisma.roofPricing.upsert({
      where: {
        name_organizationId: {
          name: 'default',
          organizationId: session.organizationId,
        },
      },
      update: {
        ...(materials !== undefined && { materials }),
        ...(options !== undefined && { options }),
        ...(minimumJobValue !== undefined && { minimumJobValue }),
        ...(priceRangeBuffer !== undefined && { priceRangeBuffer }),
        ...(wasteFactor !== undefined && { wasteFactor }),
      },
      create: {
        organizationId: session.organizationId,
        name: 'default',
        materials: materials || DEFAULT_MATERIALS as unknown as never,
        options: options || DEFAULT_OPTIONS as unknown as never,
        minimumJobValue: minimumJobValue || 1500,
        priceRangeBuffer: priceRangeBuffer || 0.15,
      },
    });

    return NextResponse.json({ success: true, pricing });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
