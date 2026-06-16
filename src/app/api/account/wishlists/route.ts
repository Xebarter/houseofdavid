import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

type Wishlist = {
  id: string;
  name: string;
  productIds: string[];
  shareId: string | null;
  created_at: string;
  updated_at: string;
};

type WishlistsDoc = {
  lists: Wishlist[];
  defaultListId: string;
  created_at: string;
  updated_at: string;
};

const COLLECTION = 'customer_wishlists';

function uniqIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.filter((v) => typeof v === 'string' && v.trim()).map((v) => v.trim()))];
}

function ensureDoc(data: unknown, now: string): WishlistsDoc {
  const d = (data ?? {}) as Partial<WishlistsDoc>;
  const existingLists = Array.isArray(d.lists) ? d.lists : [];

  // Back-compat: old schema { productIds: [] }
  const legacyIds = uniqIds((data as { productIds?: unknown } | undefined)?.productIds);

  let lists: Wishlist[] = existingLists
    .filter((l) => l && typeof l.id === 'string')
    .map((l) => ({
      id: String(l.id),
      name: String((l as any).name ?? 'Wishlist'),
      productIds: uniqIds((l as any).productIds),
      shareId: typeof (l as any).shareId === 'string' ? String((l as any).shareId) : null,
      created_at: String((l as any).created_at ?? now),
      updated_at: String((l as any).updated_at ?? now),
    }));

  if (lists.length === 0) {
    lists = [
      {
        id: 'default',
        name: 'Wishlist',
        productIds: legacyIds,
        shareId: null,
        created_at: now,
        updated_at: now,
      },
    ];
  } else if (legacyIds.length > 0) {
    // Merge legacy into default if present; otherwise into first list
    const idx = lists.findIndex((l) => l.id === 'default');
    const target = idx >= 0 ? lists[idx] : lists[0];
    const merged = [...new Set([...(target.productIds ?? []), ...legacyIds])];
    if (idx >= 0) lists[idx] = { ...target, productIds: merged, updated_at: now };
    else lists[0] = { ...target, productIds: merged, updated_at: now };
  }

  const defaultListId =
    typeof d.defaultListId === 'string' && lists.some((l) => l.id === d.defaultListId)
      ? d.defaultListId
      : lists[0].id;

  return {
    lists,
    defaultListId,
    created_at: String(d.created_at ?? now),
    updated_at: now,
  };
}

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const doc = ensureDoc(snap.exists ? snap.data() : null, now);
  if (!snap.exists) await ref.set(doc, { merge: true });

  return NextResponse.json({ ...doc });
}

export async function POST(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { name?: string };
  const name = String(body.name ?? 'Wishlist').trim() || 'Wishlist';
  const now = new Date().toISOString();

  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const doc = ensureDoc(snap.exists ? snap.data() : null, now);

  const id = randomUUID().slice(0, 8);
  const nextList: Wishlist = { id, name, productIds: [], shareId: null, created_at: now, updated_at: now };
  doc.lists = [nextList, ...doc.lists];
  doc.defaultListId = id;

  await ref.set(doc, { merge: true });
  return NextResponse.json({ ok: true, id });
}

export async function PUT(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Partial<{
    defaultListId: string;
    lists: Array<Partial<Wishlist>>;
  }>;
  const now = new Date().toISOString();

  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const doc = ensureDoc(snap.exists ? snap.data() : null, now);

  if (Array.isArray(body.lists)) {
    const patchMap = new Map(body.lists.filter((l) => l?.id).map((l) => [String(l.id), l]));
    doc.lists = doc.lists.map((l) => {
      const p = patchMap.get(l.id);
      if (!p) return l;
      const next: Wishlist = { ...l };
      if (typeof p.name === 'string') next.name = p.name.trim() || next.name;
      if ('productIds' in p) next.productIds = uniqIds((p as any).productIds);
      if ('shareId' in p) next.shareId = typeof (p as any).shareId === 'string' ? String((p as any).shareId) : null;
      next.updated_at = now;
      return next;
    });
  }

  if (typeof body.defaultListId === 'string' && doc.lists.some((l) => l.id === body.defaultListId)) {
    doc.defaultListId = body.defaultListId;
  }

  await ref.set({ ...doc, updated_at: now }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const id = String(body.id ?? '').trim();
  if (!id) return NextResponse.json({ error: 'Invalid list id' }, { status: 400 });

  const now = new Date().toISOString();
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const doc = ensureDoc(snap.exists ? snap.data() : null, now);

  doc.lists = doc.lists.filter((l) => l.id !== id);
  if (doc.lists.length === 0) {
    doc.lists = [{ id: 'default', name: 'Wishlist', productIds: [], shareId: null, created_at: now, updated_at: now }];
  }
  if (!doc.lists.some((l) => l.id === doc.defaultListId)) {
    doc.defaultListId = doc.lists[0].id;
  }

  await ref.set({ ...doc, updated_at: now }, { merge: true });
  return NextResponse.json({ ok: true });
}

