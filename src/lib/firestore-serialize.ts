import type { Timestamp } from 'firebase-admin/firestore';

export function serializeFirestoreDoc<T extends { id: string }>(
  id: string,
  data: Record<string, unknown>
): T {
  const result: Record<string, unknown> = { id };

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'toDate' in value) {
      result[key] = (value as Timestamp).toDate().toISOString();
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
