import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

export async function GET(request: NextRequest) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.email) return NextResponse.json({ orders: [] });

  const db = getAdminDb();

  // Orders are currently linked to a Customer doc created at checkout (by email).
  // We resolve the Customer by email, then list their orders.
  const customersSnap = await db
    .collection('customers')
    .where('email', '==', user.email)
    .limit(1)
    .get();

  if (customersSnap.empty) {
    return NextResponse.json({ orders: [] });
  }

  const customerId = customersSnap.docs[0].id;
  const ordersSnap = await db
    .collection('orders')
    .where('customer_id', '==', customerId)
    .orderBy('created_at', 'desc')
    .limit(25)
    .get();

  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
  return NextResponse.json({ orders });
}

