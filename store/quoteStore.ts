import { create } from 'zustand';
import type { ProcessedRoofData } from '@/lib/solar';

export type QuoteStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface ManualMeasurement {
  homeSqFt: number;
  roofType: 'gable' | 'hip' | 'flat' | 'complex';
  stories: number;
  estimatedSquares: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface QuoteState {
  // Navigation
  currentStep: QuoteStep;
  setStep: (step: QuoteStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1: Address
  address: string;
  lat: number | null;
  lng: number | null;
  setAddress: (address: string, lat: number, lng: number) => void;

  // Step 2: Roof data (Solar API or manual)
  roofData: ProcessedRoofData | null;
  setRoofData: (data: ProcessedRoofData) => void;
  manualMeasurement: ManualMeasurement | null;
  setManualMeasurement: (data: ManualMeasurement) => void;
  measurementSource: 'solar_api' | 'manual' | null;

  // Effective squares (from either source)
  effectiveSquares: number;
  effectiveSqFt: number;
  effectiveComplexity: 'simple' | 'moderate' | 'complex';

  // Step 3: Material
  selectedMaterialId: string | null;
  setMaterial: (id: string) => void;

  // Step 4: Options
  selectedOptionIds: string[];
  toggleOption: (id: string) => void;

  // Step 5: Estimate
  estimatedPriceMin: number | null;
  estimatedPriceMax: number | null;
  setEstimate: (min: number, max: number) => void;

  // Step 6: Lead form
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  intent: string;
  setLeadField: (field: string, value: string) => void;

  // Submit state
  isSubmitting: boolean;
  isSubmitted: boolean;
  setSubmitting: (v: boolean) => void;
  setSubmitted: (v: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: 1 as QuoteStep,
  address: '',
  lat: null,
  lng: null,
  roofData: null,
  manualMeasurement: null,
  measurementSource: null,
  effectiveSquares: 0,
  effectiveSqFt: 0,
  effectiveComplexity: 'moderate' as const,
  selectedMaterialId: null,
  selectedOptionIds: [],
  estimatedPriceMin: null,
  estimatedPriceMax: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  intent: 'quote_request',
  isSubmitting: false,
  isSubmitted: false,
};

export const useQuoteStore = create<QuoteState>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) as QuoteStep })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) as QuoteStep })),

  setAddress: (address, lat, lng) => set({ address, lat, lng }),

  setRoofData: (data) =>
    set({
      roofData: data,
      measurementSource: 'solar_api',
      effectiveSquares: data.squaresWithWaste,
      effectiveSqFt: data.totalAreaSqFt,
      effectiveComplexity: data.complexity,
    }),

  setManualMeasurement: (data) =>
    set({
      manualMeasurement: data,
      measurementSource: 'manual',
      effectiveSquares: data.estimatedSquares * (1 + (data.complexity === 'simple' ? 0.10 : data.complexity === 'moderate' ? 0.15 : 0.20)),
      effectiveSqFt: data.estimatedSquares * 100,
      effectiveComplexity: data.complexity,
    }),

  setMaterial: (id) => set({ selectedMaterialId: id }),

  toggleOption: (id) =>
    set((s) => ({
      selectedOptionIds: s.selectedOptionIds.includes(id)
        ? s.selectedOptionIds.filter((o) => o !== id)
        : [...s.selectedOptionIds, id],
    })),

  setEstimate: (min, max) => set({ estimatedPriceMin: min, estimatedPriceMax: max }),

  setLeadField: (field, value) => set({ [field]: value } as Partial<QuoteState>),

  setSubmitting: (v) => set({ isSubmitting: v }),
  setSubmitted: (v) => set({ isSubmitted: v }),

  reset: () => set(initialState),
}));
