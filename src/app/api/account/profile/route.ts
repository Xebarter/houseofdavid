import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

type ProfileDoc = {
  displayName: string | null;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  created_at: string;
  updated_at: string;
};

const COLLECTION = 'customer_profiles';

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);
  const snap = await ref.get();
  const now = new Date().toISOString();

  const profile: ProfileDoc = snap.exists
    ? (snap.data() as ProfileDoc)
    : {
        displayName: user.name,
        email: user.email,
        phone: null,
        photoUrl: null,
        created_at: now,
        updated_at: now,
      };

  if (!snap.exists) {
    await ref.set(profile, { merge: true });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Partial<{
    displayName: string;
    phone: string;
    photoUrl: string;
  }>;

  const patch: Partial<ProfileDoc> = {};
  if (typeof body.displayName === 'string') patch.displayName = body.displayName.trim() || null;
  if (typeof body.phone === 'string') patch.phone = body.phone.trim() || null;
  if (typeof body.photoUrl === 'string') patch.photoUrl = body.photoUrl.trim() || null;

  const now = new Date().toISOString();
  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(user.uid);

  await ref.set(
    {
      ...patch,
      email: user.email,
      updated_at: now,
      created_at: now,
    },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}

