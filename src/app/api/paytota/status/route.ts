import { NextRequest, NextResponse } from 'next/server';
import { getPurchaseStatus, mapPaytotaStatus, isPaytotaPaymentSuccessful, isPaytotaStatusPending } from '@/lib/paytota';
import { updateOrderStatus, getOrderById } from '@/lib/firestore-server';

export async function GET(request: NextRequest) {
  try {
    const purchaseId = request.nextUrl.searchParams.get('purchaseId');
    const orderId = request.nextUrl.searchParams.get('orderId');

    if (!purchaseId && !orderId) {
      return NextResponse.json({ error: 'Missing purchaseId or orderId' }, { status: 400 });
    }

    let resolvedPurchaseId = purchaseId;
    let resolvedOrderId = orderId;

    if (!resolvedPurchaseId && orderId) {
      const order = await getOrderById(orderId);
      if (!order?.payment_intent_id) {
        return NextResponse.json({ error: 'Order has no linked Paytota purchase' }, { status: 404 });
      }
      resolvedPurchaseId = order.payment_intent_id;
      resolvedOrderId = order.id;
    }

    if (!resolvedPurchaseId) {
      return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 });
    }

    const statusResponse = await getPurchaseStatus(resolvedPurchaseId);
    const orderStatus = mapPaytotaStatus(statusResponse.status);
    const finalOrderId = resolvedOrderId || statusResponse.reference;

    if (finalOrderId) {
      await updateOrderStatus(finalOrderId, orderStatus);
    }

    return NextResponse.json({
      status: statusResponse.status,
      orderStatus,
      success: isPaytotaPaymentSuccessful(statusResponse.status),
      pending: isPaytotaStatusPending(statusResponse.status),
      orderId: finalOrderId,
    });
  } catch (error) {
    console.error('Paytota status error:', error);
    return NextResponse.json({ error: 'Failed to get transaction status' }, { status: 500 });
  }
}
