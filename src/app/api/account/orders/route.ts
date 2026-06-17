import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { listOrdersForEmail } from '@/lib/account-server';
import { verifyUserRequest } from '@/lib/user-request';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUserRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.email) return NextResponse.json({ orders: [] });

    const db = getAdminDb();
    const orders = await listOrdersForEmail(db, user.email, 25);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[account/orders] GET failed:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
