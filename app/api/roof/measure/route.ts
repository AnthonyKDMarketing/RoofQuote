import { NextRequest, NextResponse } from 'next/server';
import { fetchBuildingInsights, processRoofData } from '@/lib/solar';

export async function POST(req: NextRequest) {
  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const rawData = await fetchBuildingInsights(lat, lng);

    if (!rawData) {
      // No building found — return null to trigger manual fallback
      return NextResponse.json({ found: false });
    }

    const processed = processRoofData(rawData);
    return NextResponse.json({ found: true, data: processed });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[/api/roof/measure]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
