import { NextRequest, NextResponse } from 'next/server';
import { createOrderWithItems } from '@/lib/firestore-server';
import type { CreateOrderInput } from '@/lib/types';
import { getAdminDb } from '@/lib/firebase-admin';
import { verifyUserRequest } from '@/lib/user-request';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderInput;
    const order = await createOrderWithItems(body);
    const user = await verifyUserRequest(request);
    const now = new Date().toISOString();
    await getAdminDb().collection('analytics_events').add({
      type: 'purchase',
      uid: user?.uid ?? null,
      session_id: request.headers.get('x-session-id') ?? null,
      order_id: order.id,
      value: body.total_amount,
      currency: 'UGX',
      path: '/checkout',
      referrer: request.headers.get('referer') ?? null,
      user_agent: request.headers.get('user-agent') ?? null,
      ip: request.headers.get('x-forwarded-for') ?? null,
      created_at: now,
    });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
