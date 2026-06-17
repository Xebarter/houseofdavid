import type { Firestore } from 'firebase-admin/firestore';

export type AccountOrderSummary = {
  id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
};

function sanitizeProductIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

/** Supports legacy `productIds` and multi-list wishlist schema. */
export function extractWishlistProductIds(data: Record<string, unknown> | undefined): string[] {
  if (!data) return [];

  const lists = Array.isArray(data.lists) ? (data.lists as Array<Record<string, unknown>>) : null;
  const defaultListId = typeof data.defaultListId === 'string' ? data.defaultListId : null;

  if (lists && lists.length > 0) {
    const active =
      lists.find((list) => String(list.id ?? '') === String(defaultListId ?? '')) ?? lists[0];
    return sanitizeProductIds(active?.productIds);
  }

  return sanitizeProductIds(data.productIds);
}

function toOrderSummary(id: string, data: Record<string, unknown>): AccountOrderSummary {
  const createdAt = data.created_at;
  const created_at =
    createdAt && typeof createdAt === 'object' && 'toDate' in createdAt
      ? (createdAt as { toDate: () => Date }).toDate().toISOString()
      : String(createdAt ?? '');

  return {
    id,
    status: String(data.status ?? 'pending'),
    total_amount: Number(data.total_amount ?? 0),
    currency: String(data.currency ?? 'UGX'),
    created_at,
  };
}

/** List orders for a signed-in user email without requiring a composite Firestore index. */
export async function listOrdersForEmail(
  db: Firestore,
  email: string,
  limit = 25
): Promise<AccountOrderSummary[]> {
  const customersSnap = await db.collection('customers').where('email', '==', email).limit(1).get();
  if (customersSnap.empty) return [];

  const customerId = customersSnap.docs[0].id;
  const ordersSnap = await db.collection('orders').where('customer_id', '==', customerId).get();

  return ordersSnap.docs
    .map((doc) => toOrderSummary(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}
