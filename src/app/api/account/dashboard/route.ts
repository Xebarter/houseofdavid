import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

const PROFILE_COLLECTION = 'customer_profiles';
const WISHLIST_COLLECTION = 'customer_wishlists';

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getAdminDb();
  const [profileSnap, wishlistSnap] = await Promise.all([
    db.collection(PROFILE_COLLECTION).doc(user.uid).get(),
    db.collection(WISHLIST_COLLECTION).doc(user.uid).get(),
  ]);

  const profile = profileSnap.exists
    ? (profileSnap.data() as { displayName?: string | null; email?: string | null; photoUrl?: string | null })
    : { displayName: user.name, email: user.email, photoUrl: null };

  const wishlist = wishlistSnap.exists
    ? (wishlistSnap.data() as { productIds?: string[] })
    : { productIds: [] };

  // Loyalty is implemented as a light stub for now (full ledger + tiers come next).
  const points = { balance: 0, tier: 'Silver' as const, nextTierAt: 1500 };

  let recentOrders: Array<{
    id: string;
    status: string;
    total_amount: number;
    currency: string;
    created_at: string;
  }> = [];

  if (user.email) {
    const customersSnap = await db.collection('customers').where('email', '==', user.email).limit(1).get();
    if (!customersSnap.empty) {
      const customerId = customersSnap.docs[0].id;
      const ordersSnap = await db
        .collection('orders')
        .where('customer_id', '==', customerId)
        .orderBy('created_at', 'desc')
        .limit(5)
        .get();
      recentOrders = ordersSnap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          status: String(data.status ?? 'pending'),
          total_amount: Number(data.total_amount ?? 0),
          currency: String(data.currency ?? 'UGX'),
          created_at: String(data.created_at ?? ''),
        };
      });
    }
  }

  return NextResponse.json({
    profile: {
      displayName: (profile.displayName ?? null) as string | null,
      email: (profile.email ?? user.email ?? null) as string | null,
      photoUrl: (profile.photoUrl ?? null) as string | null,
    },
    points,
    recentOrders,
    wishlist: { count: (wishlist.productIds ?? []).length, productIds: wishlist.productIds ?? [] },
  });
}

