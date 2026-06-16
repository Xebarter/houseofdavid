import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

type AnalyticsEvent = {
  type:
    | 'product_view'
    | 'wishlist_add'
    | 'wishlist_remove'
    | 'purchase'
    | 'collection_view'
    | 'collection_filter';
  product_id?: string;
  wishlist_id?: string;
  order_id?: string;
  value?: number;
  currency?: string;
  path?: string;
  referrer?: string;
  session_id?: string;
  meta?: Record<string, unknown>;
  created_at?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as AnalyticsEvent;
  const type = String(body.type ?? '').trim() as AnalyticsEvent['type'];
  if (!type) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });

  const user = await verifyUserRequest(request);
  const now = new Date().toISOString();

  const ua = request.headers.get('user-agent');
  const ip = request.headers.get('x-forwarded-for'); // may be null in dev; stored as-is if present

  const doc = {
    type,
    uid: user?.uid ?? null,
    session_id: typeof body.session_id === 'string' ? body.session_id.slice(0, 64) : null,
    product_id: typeof body.product_id === 'string' ? body.product_id : null,
    wishlist_id: typeof body.wishlist_id === 'string' ? body.wishlist_id : null,
    order_id: typeof body.order_id === 'string' ? body.order_id : null,
    value: typeof body.value === 'number' ? body.value : null,
    currency: typeof body.currency === 'string' ? body.currency : null,
    path: typeof body.path === 'string' ? body.path : null,
    referrer: typeof body.referrer === 'string' ? body.referrer : null,
    meta: body.meta && typeof body.meta === 'object' ? body.meta : null,
    user_agent: ua ?? null,
    ip: ip ?? null,
    created_at: now,
  };

  await getAdminDb().collection('analytics_events').add(doc);
  return NextResponse.json({ ok: true });
}

