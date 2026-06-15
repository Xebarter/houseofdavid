import type { Product } from './types';

/** Firestore rejects undefined and NaN — normalize before any write. */
export function sanitizeProductWriteData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (typeof value === 'number' && !Number.isFinite(value)) {
      result[key] = null;
      continue;
    }

    if (Array.isArray(value)) {
      result[key] = value.filter((item) => item !== undefined);
      continue;
    }

    result[key] = value;
  }

  return result;
}

export type ProductWritePayload = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
