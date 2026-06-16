import { NextRequest, NextResponse } from 'next/server';
import { createPurchase } from '@/lib/paytota';
import { createOrderWithItems, updateOrderPaymentIntent } from '@/lib/firestore-server';
import type { CreateOrderInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, total_amount, origin } = body as CreateOrderInput & {
      origin: string;
    };

    const order = await createOrderWithItems({ customer, items, total_amount });

    const siteOrigin = origin || request.nextUrl.origin;
    const paytotaResponse = await createPurchase(order, { customer, items, total_amount }, siteOrigin);

    await updateOrderPaymentIntent(order.id, paytotaResponse.id);

    if (!paytotaResponse.checkout_url) {
      throw new Error('Paytota did not return a checkout URL');
    }

    return NextResponse.json({
      order: { ...order, payment_intent_id: paytotaResponse.id },
      redirect_url: paytotaResponse.checkout_url,
      purchase_id: paytotaResponse.id,
    });
  } catch (error) {
    console.error('Paytota submit error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
