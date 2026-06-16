import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

type PreferenceDoc = {
  channels: {
    email: boolean;
    in_app: boolean;
  };
  topics: {
    orders: boolean;
    wishlist: boolean;
    rewards: boolean;
    promotions: boolean;
    new_arrivals: boolean;
  };
  created_at: string;
  updated_at: string;
};

const COLLECTION = 'customer_preferences';

function defaultPrefs(now: string): PreferenceDoc {
  return {
    channels: { email: true, in_app: true },
    topics: { orders: true, wishlist: true, rewards: true, promotions: true, new_arrivals: true },
    created_at: now,
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

  const prefs = snap.exists ? (snap.data() as PreferenceDoc) : defaultPrefs(now);
  if (!snap.exists) {
    await ref.set(prefs, { merge: true });
  }

  return NextResponse.json({ preferences: prefs });
}

export async function PUT(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Partial<PreferenceDoc>;
  const now = new Date().toISOString();

  const patch: Partial<PreferenceDoc> = {};
  if (body.channels) {
    patch.channels = {
      email: body.channels.email !== false,
      in_app: body.channels.in_app !== false,
    };
  }
  if (body.topics) {
    patch.topics = {
      orders: body.topics.orders !== false,
      wishlist: body.topics.wishlist !== false,
      rewards: body.topics.rewards !== false,
      promotions: body.topics.promotions !== false,
      new_arrivals: body.topics.new_arrivals !== false,
    };
  }

  const ref = getAdminDb().collection(COLLECTION).doc(user.uid);
  await ref.set({ ...patch, updated_at: now, created_at: now }, { merge: true });

  return NextResponse.json({ ok: true });
}

