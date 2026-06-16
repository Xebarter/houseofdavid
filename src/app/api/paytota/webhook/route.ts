import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { mapPaytotaStatus } from '@/lib/paytota';
import { updateOrderStatus } from '@/lib/firestore-server';

function verifySignature(publicKeyPem: string, body: string, signature: string): boolean {
  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(body);
    return verifier.verify(publicKeyPem, Buffer.from(signature, 'base64'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-Signature');
    const publicKey = process.env.PAYTOTA_PUBLIC_KEY;

    if (publicKey && signature) {
      const isValid = verifySignature(publicKey, rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody) as {
      id: string;
      status: string;
      reference?: string;
      event_type?: string;
      type?: string;
    };

    if (payload.type !== 'purchase' && !payload.event_type?.startsWith('purchase.')) {
      return NextResponse.json({ received: true });
    }

    const orderId = payload.reference;
    if (orderId && payload.status) {
      await updateOrderStatus(orderId, mapPaytotaStatus(payload.status));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paytota webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
