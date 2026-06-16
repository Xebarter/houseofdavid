import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

const WISHLISTS = 'customer_wishlists';
const NOTIFICATIONS = 'customer_notifications';
const PREFS = 'customer_preferences';

type AlertState = {
  productId: string;
  lastPrice: number | null;
  lastStock: number | null;
  enabled: boolean;
  watchPriceDrop: boolean;
  watchRestock: boolean;
  watchLowStock: boolean;
  lowStockThreshold: number;
  created_at: string;
  updated_at: string;
};

function uniqIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))];
}

export async function POST(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();
  const now = new Date().toISOString();

  const [wlSnap, prefsSnap] = await Promise.all([
    db.collection(WISHLISTS).doc(user.uid).get(),
    db.collection(PREFS).doc(user.uid).get(),
  ]);

  const prefs = prefsSnap.exists ? (prefsSnap.data() as any) : null;
  const wishlistTopicEnabled = prefs?.topics?.wishlist !== false;
  const inAppEnabled = prefs?.channels?.in_app !== false;
  if (!wishlistTopicEnabled || !inAppEnabled) {
    return NextResponse.json({ ok: true, generated: 0 });
  }

  const wlData = wlSnap.exists ? (wlSnap.data() as any) : {};
  const lists = Array.isArray(wlData.lists) ? wlData.lists : [];
  const productIds = uniqIds(lists.flatMap((l: any) => l?.productIds ?? []));
  if (productIds.length === 0) return NextResponse.json({ ok: true, generated: 0 });

  const products = await Promise.all(productIds.map((id) => db.collection('products').doc(id).get()));
  const productMap = new Map(
    products.filter((p) => p.exists).map((p) => [p.id, p.data() as any])
  );

  const alertsRef = db.collection(WISHLISTS).doc(user.uid).collection('alerts');
  const existingAlertsSnap = await alertsRef.get();
  const existing = new Map<string, AlertState>();
  existingAlertsSnap.docs.forEach((d) => existing.set(d.id, d.data() as AlertState));

  let generated = 0;
  const batch = db.batch();

  for (const pid of productIds) {
    const prod = productMap.get(pid);
    if (!prod) continue;
    const price = typeof prod.price === 'number' ? prod.price : Number(prod.price ?? 0);
    const stock = typeof prod.stock === 'number' ? prod.stock : Number(prod.stock ?? 0);

    const state = existing.get(pid);
    const enabled = state?.enabled !== false;
    const watchPriceDrop = state?.watchPriceDrop !== false;
    const watchRestock = state?.watchRestock !== false;
    const watchLowStock = state?.watchLowStock !== false;
    const lowStockThreshold = Number(state?.lowStockThreshold ?? 5);

    // Create default state if missing
    if (!state) {
      batch.set(alertsRef.doc(pid), {
        productId: pid,
        lastPrice: price,
        lastStock: stock,
        enabled: true,
        watchPriceDrop: true,
        watchRestock: true,
        watchLowStock: true,
        lowStockThreshold: 5,
        created_at: now,
        updated_at: now,
      });
      continue;
    }

    if (!enabled) {
      batch.set(alertsRef.doc(pid), { lastPrice: price, lastStock: stock, updated_at: now }, { merge: true });
      continue;
    }

    const notificationsRef = db.collection(NOTIFICATIONS).doc(user.uid).collection('items');
    const name = String(prod.name ?? 'Fragrance');

    if (watchPriceDrop && typeof state.lastPrice === 'number' && price < state.lastPrice) {
      batch.set(notificationsRef.doc(), {
        type: 'price_drop',
        title: 'Price drop',
        message: `${name} is now ${price}.`,
        href: `/product/${pid}`,
        read_at: null,
        created_at: now,
        meta: { productId: pid, from: state.lastPrice, to: price },
      });
      generated++;
    }

    if (watchRestock && typeof state.lastStock === 'number' && state.lastStock <= 0 && stock > 0) {
      batch.set(notificationsRef.doc(), {
        type: 'restocked',
        title: 'Back in stock',
        message: `${name} is available again.`,
        href: `/product/${pid}`,
        read_at: null,
        created_at: now,
        meta: { productId: pid },
      });
      generated++;
    }

    if (watchLowStock && stock > 0 && stock <= lowStockThreshold && (state.lastStock ?? stock + 1) > lowStockThreshold) {
      batch.set(notificationsRef.doc(), {
        type: 'low_inventory',
        title: 'Low inventory',
        message: `${name} is running low.`,
        href: `/product/${pid}`,
        read_at: null,
        created_at: now,
        meta: { productId: pid, stock },
      });
      generated++;
    }

    batch.set(alertsRef.doc(pid), { lastPrice: price, lastStock: stock, updated_at: now }, { merge: true });
  }

  await batch.commit();
  return NextResponse.json({ ok: true, generated });
}

