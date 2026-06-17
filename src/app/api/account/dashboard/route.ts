import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { extractWishlistProductIds, listOrdersForEmail } from '@/lib/account-server';
import { verifyUserRequest } from '@/lib/user-request';

const PROFILE_COLLECTION = 'customer_profiles';
const WISHLIST_COLLECTION = 'customer_wishlists';

export async function GET(request: NextRequest) {
  try {
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

    const wishlistData = wishlistSnap.exists
      ? (wishlistSnap.data() as Record<string, unknown>)
      : undefined;
    const productIds = extractWishlistProductIds(wishlistData);

    const points = { balance: 0, tier: 'Silver' as const, nextTierAt: 1500 };

    const recentOrders = user.email ? await listOrdersForEmail(db, user.email, 5) : [];

    return NextResponse.json({
      profile: {
        displayName: (profile.displayName ?? null) as string | null,
        email: (profile.email ?? user.email ?? null) as string | null,
        photoUrl: (profile.photoUrl ?? null) as string | null,
      },
      points,
      recentOrders,
      wishlist: { count: productIds.length, productIds },
    });
  } catch (error) {
    console.error('[account/dashboard] GET failed:', error);
    return NextResponse.json({ error: 'Failed to load account dashboard' }, { status: 500 });
  }
}
