/**
 * Roof Calculation Engine
 * Handles pricing calculations from roof measurements + admin config
 */

export interface Material {
  id: string;
  name: string;
  description: string;
  pricePerSquare: number;
  laborMultiplier: number; // Multiply material cost by this for total installed
  lifespan: string;
  isActive: boolean;
}

export interface Option {
  id: string;
  name: string;
  description: string;
  pricingType: 'flat' | 'per_square' | 'per_sqft';
  value: number;
  isActive: boolean;
}

export interface WasteFactors {
  simple: number;
  moderate: number;
  complex: number;
}

export interface PricingConfig {
  materials: Material[];
  options: Option[];
  minimumJobValue: number;
  priceRangeBuffer: number;
  wasteFactor: WasteFactors;
}

export interface EstimateResult {
  squaresUsed: number;
  materialCost: number;
  laborCost: number;
  optionsCost: number;
  subtotal: number;
  priceMin: number;
  priceMax: number;
  breakdown: {
    label: string;
    amount: number;
    detail?: string;
  }[];
}

/**
 * Calculate manual fallback squares from home square footage
 * Uses industry standard: roof area = home footprint × pitch multiplier × stories factor
 */
export function estimateSquaresFromHomeSqFt(
  homeSqFt: number,
  roofType: string,
  stories: number
): { squares: number; complexity: 'simple' | 'moderate' | 'complex'; wasteFactor: number } {
  // Typical ratio: roof area is ~1.3–1.6x the home footprint for 1-story
  // For single story with common pitches (6:12), multiplier ~1.12; + overhang factor ~1.1
  const pitchMultipliers: Record<string, number> = {
    flat: 1.05,
    gable: 1.15,
    hip: 1.25,
    complex: 1.40,
  };

  const pitchMultiplier = pitchMultipliers[roofType] || 1.20;

  // For multi-story homes, roof covers the footprint (not multiplied by stories)
  // But footprint is typically homeSqFt / stories
  const footprintSqFt = homeSqFt / stories;
  const roofAreaSqFt = footprintSqFt * pitchMultiplier * 1.05; // 5% overhang/eave
  const squares = roofAreaSqFt / 100;

  const complexityMap: Record<string, 'simple' | 'moderate' | 'complex'> = {
    flat: 'simple',
    gable: 'simple',
    hip: 'moderate',
    complex: 'complex',
  };
  const complexity = complexityMap[roofType] || 'moderate';
  const wasteFactors = { simple: 0.10, moderate: 0.15, complex: 0.20 };

  return {
    squares: Math.round(squares * 10) / 10,
    complexity,
    wasteFactor: wasteFactors[complexity],
  };
}

/**
 * Calculate estimate from squares + selected material + options
 */
export function calculateEstimate(
  squares: number,
  sqFt: number,
  materialId: string,
  selectedOptionIds: string[],
  config: PricingConfig,
  complexityOverride?: 'simple' | 'moderate' | 'complex'
): EstimateResult {
  const material = config.materials.find((m) => m.id === materialId);
  if (!material) {
    throw new Error(`Material not found: ${materialId}`);
  }

  const breakdown: EstimateResult['breakdown'] = [];

  // Material + labor cost
  const materialCostPerSquare = material.pricePerSquare;
  const totalInstalledPerSquare = materialCostPerSquare * material.laborMultiplier;
  const materialCost = Math.round(squares * materialCostPerSquare);
  const laborCost = Math.round(squares * (totalInstalledPerSquare - materialCostPerSquare));

  breakdown.push({
    label: material.name,
    amount: materialCost + laborCost,
    detail: `${squares} squares × $${totalInstalledPerSquare.toFixed(0)}/sq installed`,
  });

  // Options cost
  let optionsCost = 0;
  const selectedOptions = config.options.filter((o) => selectedOptionIds.includes(o.id));

  for (const option of selectedOptions) {
    let cost = 0;
    switch (option.pricingType) {
      case 'flat':
        cost = option.value;
        break;
      case 'per_square':
        cost = Math.round(squares * option.value);
        break;
      case 'per_sqft':
        cost = Math.round(sqFt * option.value);
        break;
    }
    optionsCost += cost;
    breakdown.push({
      label: option.name,
      amount: cost,
      detail: option.description,
    });
  }

  const subtotal = materialCost + laborCost + optionsCost;
  const finalTotal = Math.max(subtotal, config.minimumJobValue);

  if (finalTotal !== subtotal) {
    breakdown.push({
      label: 'Minimum Job Value',
      amount: finalTotal - subtotal,
      detail: `Project minimum applied`,
    });
  }

  // Apply price range buffer (±%)
  const buffer = config.priceRangeBuffer;
  const priceMin = Math.round(finalTotal * (1 - buffer / 2));
  const priceMax = Math.round(finalTotal * (1 + buffer / 2));

  return {
    squaresUsed: squares,
    materialCost,
    laborCost,
    optionsCost,
    subtotal: finalTotal,
    priceMin,
    priceMax,
    breakdown,
  };
}

/**
 * Default materials for seeding new organizations
 */
export const DEFAULT_MATERIALS: Material[] = [
  {
    id: 'arch-shingle-std',
    name: 'Architectural Shingles (Standard)',
    description: 'GAF Timberline HDZ or equivalent — most popular residential choice',
    pricePerSquare: 280,
    laborMultiplier: 2.2,
    lifespan: '25–30 years',
    isActive: true,
  },
  {
    id: 'arch-shingle-premium',
    name: 'Architectural Shingles (Premium)',
    description: 'GAF Timberline UHDZ or Owens Corning Duration Designer',
    pricePerSquare: 380,
    laborMultiplier: 2.2,
    lifespan: '30–50 years',
    isActive: true,
  },
  {
    id: 'metal-standing-seam',
    name: 'Metal Roofing (Standing Seam)',
    description: 'Premium concealed fastener metal — ideal for longevity and energy efficiency',
    pricePerSquare: 700,
    laborMultiplier: 2.0,
    lifespan: '40–70 years',
    isActive: true,
  },
  {
    id: 'metal-corrugated',
    name: 'Metal Roofing (Corrugated)',
    description: 'Exposed fastener steel panels — durable and cost-effective metal option',
    pricePerSquare: 450,
    laborMultiplier: 1.9,
    lifespan: '40–60 years',
    isActive: true,
  },
  {
    id: 'tpo-flat',
    name: 'TPO (Flat / Low-Slope)',
    description: 'Thermoplastic polyolefin membrane — standard for flat or low-slope roofs',
    pricePerSquare: 350,
    laborMultiplier: 2.0,
    lifespan: '15–20 years',
    isActive: true,
  },
];

/**
 * Default options for seeding new organizations
 */
export const DEFAULT_OPTIONS: Option[] = [
  {
    id: 'tearoff-1layer',
    name: 'Tear-Off (1 Layer)',
    description: 'Remove existing single layer of roofing',
    pricingType: 'per_square',
    value: 65,
    isActive: true,
  },
  {
    id: 'tearoff-2layer',
    name: 'Tear-Off (2+ Layers)',
    description: 'Remove multiple existing roofing layers',
    pricingType: 'per_square',
    value: 120,
    isActive: true,
  },
  {
    id: 'synthetic-underlayment',
    name: 'Synthetic Underlayment Upgrade',
    description: 'Premium synthetic felt vs. standard #30 felt',
    pricingType: 'per_square',
    value: 25,
    isActive: true,
  },
  {
    id: 'ice-water-shield',
    name: 'Ice & Water Shield (Full)',
    description: 'Full-coverage ice & water shield for enhanced protection',
    pricingType: 'per_square',
    value: 35,
    isActive: true,
  },
  {
    id: 'ridge-vent',
    name: 'Ridge Vent Installation',
    description: 'Install continuous ridge vent for proper attic ventilation',
    pricingType: 'flat',
    value: 450,
    isActive: true,
  },
  {
    id: 'dumpster-haul',
    name: 'Dumpster / Haul-Off',
    description: 'Debris removal dumpster and haul-off service',
    pricingType: 'flat',
    value: 400,
    isActive: true,
  },
  {
    id: 'chimney-flashing',
    name: 'Chimney Flashing Replacement',
    description: 'Replace worn or damaged chimney flashing',
    pricingType: 'flat',
    value: 450,
    isActive: true,
  },
  {
    id: 'drip-edge',
    name: 'Drip Edge Replacement',
    description: 'Replace perimeter drip edge metal',
    pricingType: 'per_sqft',
    value: 0.25,
    isActive: true,
  },
];
