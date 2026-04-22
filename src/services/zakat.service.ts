import type { ZakatCalculationInput } from '../schemas/zakat.schema.js';

type ZakatBreakdown = {
  assetType: ZakatCalculationInput['assetType'];
  grossAmount: number;
  deductions: number;
  eligibleAmount: number;
  nisabAmount: number;
  qualifies: boolean;
  zakatRate: number;
  zakatDue: number;
};

type ZakatStrategy = (input: ZakatCalculationInput) => ZakatBreakdown;

const ZAKAT_RATE = 0.025;

const createStandardStrategy =
  (assetType: ZakatCalculationInput['assetType']): ZakatStrategy =>
  (input) => {
    const eligibleAmount = Math.max(input.grossAmount - input.deductions, 0);
    const qualifies = eligibleAmount >= input.nisabAmount;

    return {
      assetType,
      grossAmount: input.grossAmount,
      deductions: input.deductions,
      eligibleAmount,
      nisabAmount: input.nisabAmount,
      qualifies,
      zakatRate: ZAKAT_RATE,
      zakatDue: qualifies ? Number((eligibleAmount * ZAKAT_RATE).toFixed(2)) : 0,
    };
  };

const strategies: Record<ZakatCalculationInput['assetType'], ZakatStrategy> = {
  gold: createStandardStrategy('gold'),
  cash: createStandardStrategy('cash'),
  business_assets: createStandardStrategy('business_assets'),
};

export const calculateZakat = (input: ZakatCalculationInput) => strategies[input.assetType](input);
