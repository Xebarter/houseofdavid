import { NextRequest, NextResponse } from 'next/server';
import { createOrderWithItems } from '@/lib/firestore';
import type { CreateOrderInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderInput;
    const order = await createOrderWithItems(body);
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
