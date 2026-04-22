import { z } from 'zod';

export const zakatAssetTypeSchema = z.enum(['gold', 'cash', 'business_assets']);

export const zakatCalculationSchema = z.object({
  assetType: zakatAssetTypeSchema,
  grossAmount: z.number().min(0),
  deductions: z.number().min(0).default(0),
  nisabAmount: z.number().min(0),
  notes: z.string().trim().max(1000).optional(),
});

export type ZakatCalculationInput = z.infer<typeof zakatCalculationSchema>;
