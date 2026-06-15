/**
 * Google Solar API Client
 * Provides roof measurement data using Google's 3D aerial imagery
 * Docs: https://developers.google.com/maps/documentation/solar/overview
 */

export interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: {
    areaMeters2: number;
    sunshineQuantiles?: number[];
    groundAreaMeters2: number;
  };
  center: { latitude: number; longitude: number };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
}

export interface SolarBuildingInsights {
  name: string;
  center: { latitude: number; longitude: number };
  imageryDate: { year: number; month: number; day: number };
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  solarPotential: {
    maxArrayPanelsCount: number;
    roofSegmentStats: RoofSegment[];
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles?: number[];
      groundAreaMeters2: number;
    };
    buildingStats?: {
      areaMeters2: number;
    };
  };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  regionCode?: string;
  postalCode?: string;
  administrativeArea?: string;
  statisticalArea?: string;
  placeId?: string;
}

export interface ProcessedRoofData {
  source: 'solar_api';
  // Raw segments from Solar API
  segments: RoofSegment[];
  imageryQuality: string;
  // Computed measurements
  totalAreaSqFt: number;       // True 3D roof area in sq ft
  groundAreaSqFt: number;      // Flat footprint area
  roofingSquares: number;      // totalAreaSqFt / 100
  avgPitchDegrees: number;     // Weighted average pitch
  avgPitchRatio: string;       // e.g. "6:12"
  segmentCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  wasteFactor: number;
  squaresWithWaste: number;    // Squares after waste factor
  center: { lat: number; lng: number };
  // Raw response for storage
  rawData: SolarBuildingInsights;
}

const SQ_METERS_TO_SQ_FT = 10.7639;

/**
 * Fetch building insights from Google Solar API
 */
export async function fetchBuildingInsights(
  lat: number,
  lng: number
): Promise<SolarBuildingInsights | null> {
  const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_SOLAR_API_KEY is not configured');
  }

  const url = new URL('https://solar.googleapis.com/v1/buildingInsights:findClosest');
  url.searchParams.set('location.latitude', lat.toString());
  url.searchParams.set('location.longitude', lng.toString());
  url.searchParams.set('requiredQuality', 'LOW'); // Accept any quality for coverage
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Solar API] Error ${response.status}:`, errorText);

    // 404 means no building found at this location
    if (response.status === 404) return null;
    throw new Error(`Solar API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Convert pitch degrees to rise:run ratio string (e.g. "6:12")
 */
function degreesToPitchRatio(degrees: number): string {
  const rise = Math.tan((degrees * Math.PI) / 180) * 12;
  const rounded = Math.round(rise * 2) / 2; // round to nearest 0.5
  return `${rounded}:12`;
}

/**
 * Determine roof complexity score
 */
function getComplexity(segmentCount: number): 'simple' | 'moderate' | 'complex' {
  if (segmentCount <= 2) return 'simple';
  if (segmentCount <= 5) return 'moderate';
  return 'complex';
}

/**
 * Process raw Solar API response into usable roof measurements
 */
export function processRoofData(data: SolarBuildingInsights): ProcessedRoofData {
  const segments = data.solarPotential.roofSegmentStats;
  const totalAreaM2 = data.solarPotential.wholeRoofStats.areaMeters2;
  const groundAreaM2 = data.solarPotential.wholeRoofStats.groundAreaMeters2;

  // Convert to sq ft
  const totalAreaSqFt = totalAreaM2 * SQ_METERS_TO_SQ_FT;
  const groundAreaSqFt = groundAreaM2 * SQ_METERS_TO_SQ_FT;
  const roofingSquares = totalAreaSqFt / 100;

  // Weighted average pitch (weight by area of each segment)
  const avgPitchDegrees =
    segments.reduce((sum, s) => sum + s.pitchDegrees * s.stats.areaMeters2, 0) / totalAreaM2;

  const complexity = getComplexity(segments.length);

  // Waste factors
  const wasteFactors = { simple: 0.10, moderate: 0.15, complex: 0.20 };
  const wasteFactor = wasteFactors[complexity];
  const squaresWithWaste = roofingSquares * (1 + wasteFactor);

  return {
    source: 'solar_api',
    segments,
    imageryQuality: data.imageryQuality,
    totalAreaSqFt: Math.round(totalAreaSqFt),
    groundAreaSqFt: Math.round(groundAreaSqFt),
    roofingSquares: Math.round(roofingSquares * 10) / 10,
    avgPitchDegrees: Math.round(avgPitchDegrees * 10) / 10,
    avgPitchRatio: degreesToPitchRatio(avgPitchDegrees),
    segmentCount: segments.length,
    complexity,
    wasteFactor,
    squaresWithWaste: Math.round(squaresWithWaste * 10) / 10,
    center: {
      lat: data.center.latitude,
      lng: data.center.longitude,
    },
    rawData: data,
  };
}
