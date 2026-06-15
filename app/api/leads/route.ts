import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendCustomerConfirmationEmail,
  sendAdminLeadAlertEmail,
  sendAdminLeadAlertSMS,
} from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationSlug,
      firstName,
      lastName,
      email,
      phone,
      address,
      lat,
      lng,
      // Roof data
      measurementSource,
      roofSquares,
      roofAreaSqFt,
      roofPitchDegrees,
      roofComplexity,
      roofSegmentCount,
      roofDataJson,
      // Manual fallback
      manualHomeSqFt,
      manualRoofType,
      manualStories,
      // Selections
      selectedMaterial,
      selectedOptions,
      // Estimate
      estimatedPriceMin,
      estimatedPriceMax,
      // Meta
      intent,
    } = body;

    if (!organizationSlug || !firstName || !lastName || !email || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
    });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check for duplicate (same email + address within 24h)
    const recentDuplicate = await prisma.lead.findFirst({
      where: {
        organizationId: org.id,
        email,
        address,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        firstName,
        lastName,
        email,
        phone: phone || null,
        address,
        latitude: lat || null,
        longitude: lng || null,
        measurementSource: measurementSource || 'manual',
        roofSquares: roofSquares || null,
        roofAreaSqFt: roofAreaSqFt || null,
        roofPitchDegrees: roofPitchDegrees || null,
        roofComplexity: roofComplexity || null,
        roofSegmentCount: roofSegmentCount || null,
        roofDataJson: roofDataJson || null,
        manualHomeSqFt: manualHomeSqFt || null,
        manualRoofType: manualRoofType || null,
        manualStories: manualStories || null,
        selectedMaterial: selectedMaterial || null,
        selectedOptions: selectedOptions || [],
        estimatedPriceMin: estimatedPriceMin || null,
        estimatedPriceMax: estimatedPriceMax || null,
        intent: intent || 'quote_request',
        status: 'new',
        isDuplicate: !!recentDuplicate,
      },
    });

    // Notifications
    const notifDetails = {
      customerName: `${firstName} ${lastName}`,
      email,
      phone,
      address,
      estimatedPriceMin: estimatedPriceMin || 0,
      estimatedPriceMax: estimatedPriceMax || 0,
      selectedMaterial,
      roofSquares,
    };

    // Customer confirmation
    if (org.emailNotifications) {
      await sendCustomerConfirmationEmail(email, notifDetails, org.name);
    }

    // Admin alerts
    if (org.adminEmail) {
      await sendAdminLeadAlertEmail(org.adminEmail, notifDetails, org.name);
    }
    if (org.smsNotifications && org.adminPhone) {
      await sendAdminLeadAlertSMS(org.adminPhone, notifDetails, org.name);
    }

    // Webhook
    if (org.webhookUrl) {
      fetch(org.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead.created', lead, organization: { name: org.name, slug: org.slug } }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[POST /api/leads]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
