import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

const COLLECTION = 'customer_wishlists';

function sanitizeIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((v) => typeof v === 'string' && v.trim().length > 0).map((v) => v.trim()))];
}

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ref = getAdminDb().collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const data = snap.exists ? (snap.data() as { productIds?: string[] }) : {};
  const productIds = sanitizeIds((data as any).productIds);
  // Back-compat: if new multi-list schema is present, return the default list items.
  const lists = Array.isArray((data as any).lists) ? ((data as any).lists as any[]) : null;
  const defaultListId = typeof (data as any).defaultListId === 'string' ? (data as any).defaultListId : null;
  if (lists && lists.length > 0) {
    const def = lists.find((l) => String(l?.id ?? '') === String(defaultListId ?? '')) ?? lists[0];
    return NextResponse.json({ productIds: sanitizeIds(def?.productIds) });
  }
  return NextResponse.json({ productIds });
}

export async function PUT(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { productIds?: unknown };
  const productIds = sanitizeIds(body.productIds);

  const ref = getAdminDb().collection(COLLECTION).doc(user.uid);
  await ref.set(
    {
      // Legacy endpoint updates the default list for compatibility.
      productIds,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}

