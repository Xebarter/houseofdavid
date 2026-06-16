import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await verifyUserRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const orderId = String(id || '').trim();
  if (!orderId) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });

  const db = getAdminDb();
  const customersSnap = await db.collection('customers').where('email', '==', user.email).limit(1).get();
  if (customersSnap.empty) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const customerId = customersSnap.docs[0].id;
  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const order = { id: orderSnap.id, ...(orderSnap.data() as Record<string, unknown>) } as Record<
    string,
    unknown
  >;
  if (String(order['customer_id'] ?? '') !== customerId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const itemsSnap = await db.collection('order_items').where('order_id', '==', orderId).get();
  const items = itemsSnap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }) as Record<string, unknown>
  );

  const productIds = [
    ...new Set(items.map((i) => String(i['product_id'] ?? '')).filter(Boolean)),
  ];
  const productDocs = await Promise.all(productIds.map((pid) => db.collection('products').doc(pid).get()));
  const products = productDocs
    .filter((d) => d.exists)
    .map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

  return NextResponse.json({ order, items, products });
}

