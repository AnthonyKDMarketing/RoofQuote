import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: {
        id: true, slug: true, name: true, website: true,
        primaryColor: true, secondaryColor: true, accentColor: true,
        logoUrl: true, font: true,
        adminEmail: true, adminPhone: true,
        emailNotifications: true, smsNotifications: true, webhookUrl: true,
        hostedPageEnabled: true, hostedPageHeadline: true, hostedPageSubheading: true,
        hostedPagePhone: true, hostedPageEmail: true, hostedPageCity: true,
        hostedPageState: true, hostedPageCoverUrl: true,
        subscriptionStatus: true, planType: true, stripeCustomerId: true,
        tutorialCompleted: true,
      },
    });

    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(org);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, ...fields } = body;

    if (action === 'complete-tutorial') {
      await prisma.organization.update({
        where: { id: session.organizationId },
        data: { tutorialCompleted: true },
      });
      return NextResponse.json({ success: true });
    }

    // Update org fields directly
    const allowedFields = [
      'name', 'website', 'primaryColor', 'secondaryColor', 'accentColor',
      'logoUrl', 'font', 'adminEmail', 'adminPhone',
      'emailNotifications', 'smsNotifications', 'webhookUrl',
      'hostedPageEnabled', 'hostedPageHeadline', 'hostedPageSubheading',
      'hostedPagePhone', 'hostedPageEmail', 'hostedPageCity',
      'hostedPageState', 'hostedPageCoverUrl',
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in fields) updateData[key] = fields[key];
    }

    const org = await prisma.organization.update({
      where: { id: session.organizationId },
      data: updateData,
    });

    return NextResponse.json({ success: true, org });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
