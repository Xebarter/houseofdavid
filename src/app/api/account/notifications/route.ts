import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

type NotificationItem = {
  id: string;
  type:
    | 'order_update'
    | 'shipment_update'
    | 'price_drop'
    | 'restocked'
    | 'low_inventory'
    | 'promotion'
    | 'new_arrival'
    | 'reward';
  title: string;
  message: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
  meta?: Record<string, unknown>;
};

const COLLECTION = 'customer_notifications';

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();
  const itemsSnap = await db
    .collection(COLLECTION)
    .doc(user.uid)
    .collection('items')
    .orderBy('created_at', 'desc')
    .limit(50)
    .get();

  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
  const unread = items.filter((n) => !n.read_at).length;
  return NextResponse.json({ items, unread });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { id?: string; markAllRead?: boolean };
  const db = getAdminDb();
  const now = new Date().toISOString();

  if (body.markAllRead) {
    const snap = await db.collection(COLLECTION).doc(user.uid).collection('items').where('read_at', '==', null).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { read_at: now }));
    await batch.commit();
    return NextResponse.json({ ok: true });
  }

  const id = String(body.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'Invalid notification id' }, { status: 400 });

  await db.collection(COLLECTION).doc(user.uid).collection('items').doc(id).set({ read_at: now }, { merge: true });
  return NextResponse.json({ ok: true });
}

